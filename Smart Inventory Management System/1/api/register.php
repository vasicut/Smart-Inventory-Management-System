<?php
header('Content-Type: application/json');
require 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $username = htmlspecialchars(strip_tags($data->username));
    $password_hash = password_hash($data->password, PASSWORD_DEFAULT);

    // Verifică dacă username-ul există deja
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $checkStmt->bind_param("s", $username);
    $checkStmt->execute();
    $checkStmt->store_result();

    if ($checkStmt->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Username already exists."]);
        $checkStmt->close();
        $conn->close();
        exit;
    }
    $checkStmt->close();

    // Inserează utilizatorul
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $password_hash);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User registered."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error occurred during registration."]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid input."]);
}

$conn->close();
?>
