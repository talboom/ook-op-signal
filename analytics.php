<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration - UPDATE THESE VALUES
$db_host = 'localhost';
$db_name = 'your_database_name';
$db_user = 'your_username';
$db_pass = 'your_password';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Increment visit counter
        $stmt = $pdo->prepare("
            INSERT INTO analytics (counter_name, count_value)
            VALUES ('page_visits', 1)
            ON DUPLICATE KEY UPDATE count_value = count_value + 1
        ");
        $stmt->execute();

        // Get updated count
        $stmt = $pdo->prepare("SELECT count_value FROM analytics WHERE counter_name = 'page_visits'");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'count' => (int)$result['count_value']
        ]);

    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Just get current count without incrementing
        $stmt = $pdo->prepare("SELECT count_value FROM analytics WHERE counter_name = 'page_visits'");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'count' => (int)($result['count_value'] ?? 0)
        ]);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}
?>