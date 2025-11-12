<?php
// Minimal suppliers API that ensures materials.supplier_id exists and returns suppliers JSON.

// Add CORS headers
header('Access-Control-Allow-Origin: *'); // Adjust as needed for Next.js frontend
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

header('Content-Type: application/json; charset=utf-8');

$dbHost = '127.0.0.1';
$dbName = 'consty';
$dbUser = 'root';
$dbPass = ''; // adjust if you use a password

try {
	$pdo = new PDO("mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
	]);

	// Ensure the materials.supplier_id column exists. This is idempotent.
	$checkStmt = $pdo->prepare("
		SELECT COUNT(*) AS cnt
		FROM information_schema.COLUMNS
		WHERE TABLE_SCHEMA = :db
		  AND TABLE_NAME = 'materials'
		  AND COLUMN_NAME = 'supplier_id'
	");
	$checkStmt->execute([':db' => $dbName]);
	$exists = (int)$checkStmt->fetchColumn() > 0;

	if (!$exists) {
		// Add the column; keep it nullable to avoid breaking existing rows.
		// Do not add foreign key constraints here to avoid migration issues — add them manually if desired.
		$pdo->exec("ALTER TABLE `materials` ADD COLUMN `supplier_id` INT NULL");
		// Optionally, set default values or backfill here if needed.
	}

	// Handle POST (add supplier)
	if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		$input = json_decode(file_get_contents('php://input'), true);
		if (!$input || !isset($input['name'])) {
			http_response_code(400);
			echo json_encode(['error' => 'Supplier name is required']);
			exit;
		}
		$name = $input['name'];
		$contact_email = $input['contact_email'] ?? null;
		$contact_phone = $input['contact_phone'] ?? null;
		$address = $input['address'] ?? null;

		$stmt = $pdo->prepare("INSERT INTO suppliers (name, contact_email, contact_phone, address, created_at) VALUES (?, ?, ?, ?, NOW())");
		$stmt->execute([$name, $contact_email, $contact_phone, $address]);
		$id = $pdo->lastInsertId();

		// Return the new supplier
		$supplier = $pdo->query("SELECT * FROM suppliers WHERE id = $id")->fetch();
		echo json_encode(['success' => true, 'supplier' => $supplier]);
		exit;
	}

	// Fetch suppliers and include count of materials referencing each supplier (safe if supplier_id now exists)
	$q = "
		SELECT s.*, (
			SELECT COUNT(*) FROM materials m WHERE m.supplier_id = s.id
		) AS materials_count
		FROM suppliers s
		ORDER BY s.name ASC
	";
	$stmt = $pdo->query($q);
	$suppliers = $stmt->fetchAll();

	echo json_encode(['suppliers' => $suppliers]);
	exit;
} catch (PDOException $e) {
	// Return an error JSON instead of letting PHP throw a fatal error
	http_response_code(500);
	echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
	exit;
}

// $method = $_SERVER['REQUEST_METHOD'];
// $id = isset($_GET['id']) ? intval($_GET['id']) : null;

// // GET: List all or single supplier
// if ($method === 'GET') {
//     if ($id) {
//         $stmt = $pdo->prepare('
//             SELECT s.*, 
//                 (SELECT JSON_ARRAYAGG(JSON_OBJECT("id", m.id, "name", m.name)) 
//                  FROM materials m WHERE m.supplier_id = s.id) AS materials_supplied,
//                 (SELECT JSON_ARRAYAGG(JSON_OBJECT("id", ma.id, "name", ma.name)) 
//                  FROM machines ma WHERE ma.supplier_id = s.id) AS machines_supplied
//             FROM suppliers s WHERE s.id = ?
//         ');
//         $stmt->execute([$id]);
//         $supplier = $stmt->fetch();
//         echo json_encode(['supplier' => $supplier]);
//     } else {
//         $stmt = $pdo->query('
//             SELECT s.*, 
//                 (SELECT COUNT(*) FROM materials m WHERE m.supplier_id = s.id) AS materials_count,
//                 (SELECT COUNT(*) FROM machines ma WHERE ma.supplier_id = s.id) AS machines_count
//             FROM suppliers s ORDER BY s.id DESC
//         ');
//         $suppliers = $stmt->fetchAll();
//         echo json_encode(['suppliers' => $suppliers]);
//     }
//     exit();
// }

// // POST: Add new supplier
// if ($method === 'POST') {
//     $input = json_decode(file_get_contents('php://input'), true);
//     $name = $input['name'] ?? '';
//     $contact_email = $input['contact_email'] ?? '';
//     $contact_phone = $input['contact_phone'] ?? '';
//     $address = $input['address'] ?? '';
//     if (!$name || !$contact_email || !$contact_phone || !$address) {
//         http_response_code(400);
//         echo json_encode(['error' => 'All fields are required']);
//         exit();
//     }
//     $stmt = $pdo->prepare('INSERT INTO suppliers (name, contact_email, contact_phone, address) VALUES (?, ?, ?, ?)');
//     $stmt->execute([$name, $contact_email, $contact_phone, $address]);
//     echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
//     exit();
// }

// // DELETE: Remove supplier
// if ($method === 'DELETE') {
//     $input = json_decode(file_get_contents('php://input'), true);
//     $id = $input['id'] ?? null;
//     if (!$id) {
//         http_response_code(400);
//         echo json_encode(['error' => 'Supplier ID required']);
//         exit();
//     }
//     $stmt = $pdo->prepare('DELETE FROM suppliers WHERE id = ?');
//     $stmt->execute([$id]);
//     echo json_encode(['success' => true]);
//     exit();
// }

// // PATCH: Update supplier
// if ($method === 'PATCH') {
//     $input = json_decode(file_get_contents('php://input'), true);
//     $id = $input['id'] ?? null;
//     $name = $input['name'] ?? null;
//     $contact_email = $input['contact_email'] ?? null;
//     $contact_phone = $input['contact_phone'] ?? null;
//     $address = $input['address'] ?? null;
//     if (!$id) {
//         http_response_code(400);
//         echo json_encode(['error' => 'Supplier ID required']);
//         exit();
//     }
//     $fields = [];
//     $params = [];
//     if ($name !== null) { $fields[] = 'name = ?'; $params[] = $name; }
//     if ($contact_email !== null) { $fields[] = 'contact_email = ?'; $params[] = $contact_email; }
//     if ($contact_phone !== null) { $fields[] = 'contact_phone = ?'; $params[] = $contact_phone; }
//     if ($address !== null) { $fields[] = 'address = ?'; $params[] = $address; }
//     if (count($fields) === 0) {
//         http_response_code(400);
//         echo json_encode(['error' => 'No fields to update']);
//         exit();
//     }
//     $params[] = $id;
//     $sql = 'UPDATE suppliers SET ' . implode(', ', $fields) . ' WHERE id = ?';
//     $stmt = $pdo->prepare($sql);
//     $stmt->execute($params);
//     echo json_encode(['success' => true]);
//     exit();
// }

// // // Fallback for unsupported methods
// // http_response_code(400);
// // echo json_encode(['error' => 'Invalid request']);
// //     exit();
// }

// // DELETE: Remove supplier
// if ($method === 'DELETE') {
//     if (!$id) {
//         http_response_code(400);
//         echo json_encode(['error' => 'Supplier ID required']);
//         exit;
//     }
//     $supplier = get_supplier($conn, $id);
//     if (!$supplier) {
//         http_response_code(404);
//         echo json_encode(['error' => 'Supplier not found']);
//         exit;
//     }
//     $stmt = $conn->prepare("DELETE FROM suppliers WHERE id=?");
//     $stmt->bind_param("i", $id);
//     if ($stmt->execute()) {
//         echo json_encode(['message' => 'Supplier deleted']);
//     } else {
//         http_response_code(500);
//         echo json_encode(['error' => 'Failed to delete supplier']);
//     }
//     exit;
// }

// // Fallback
// http_response_code(405);
// echo json_encode(['error' => 'Method not allowed']);
