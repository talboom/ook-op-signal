<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $env = parse_ini_file(__DIR__ . '/.env');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Database configuration from environment
$db_host = $_ENV['DB_HOST'] ?? 'localhost';
$db_name = $_ENV['DB_NAME'] ?? '';
$db_user = $_ENV['DB_USER'] ?? '';
$db_pass = $_ENV['DB_PASS'] ?? '';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get the event type from POST data
        $input = json_decode(file_get_contents('php://input'), true);
        $event_type = $input['event'] ?? 'page_visits';

        // Validate event type
        $allowed_events = ['page_visits', 'upload_clicks', 'download_clicks'];
        if (!in_array($event_type, $allowed_events)) {
            $event_type = 'page_visits';
        }

        // Increment counter for today's date
        $today = date('Y-m-d');
        $stmt = $pdo->prepare("
            INSERT INTO analytics (counter_name, count_value, date)
            VALUES (?, 1, ?)
            ON DUPLICATE KEY UPDATE count_value = count_value + 1
        ");
        $stmt->execute([$event_type, $today]);

        // Get updated count for today
        $stmt = $pdo->prepare("SELECT count_value FROM analytics WHERE counter_name = ? AND date = ?");
        $stmt->execute([$event_type, $today]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'event' => $event_type,
            'count' => (int)$result['count_value']
        ]);

    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get counts for all events or a specific event
        $event_type = $_GET['event'] ?? null;

        if ($event_type) {
            // Get count for specific event today
            $today = date('Y-m-d');
            $stmt = $pdo->prepare("SELECT count_value FROM analytics WHERE counter_name = ? AND date = ?");
            $stmt->execute([$event_type, $today]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'event' => $event_type,
                'date' => $today,
                'count' => (int)($result['count_value'] ?? 0)
            ]);
        } else {
            // Get today's counts for all events
            $today = date('Y-m-d');
            $stmt = $pdo->prepare("SELECT counter_name, count_value FROM analytics WHERE date = ? AND counter_name IN ('page_visits', 'upload_clicks', 'download_clicks')");
            $stmt->execute([$today]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $counts = [];
            foreach ($results as $row) {
                $counts[$row['counter_name']] = (int)$row['count_value'];
            }

            // Ensure all counters exist in response
            $counts['page_visits'] = $counts['page_visits'] ?? 0;
            $counts['upload_clicks'] = $counts['upload_clicks'] ?? 0;
            $counts['download_clicks'] = $counts['download_clicks'] ?? 0;

            echo json_encode([
                'success' => true,
                'date' => $today,
                'counts' => $counts
            ]);
        }

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