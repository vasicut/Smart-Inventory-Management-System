<?php
header('Content-Type: application/json');
require 'db_connect.php';

$username = $_GET['user'] ?? '';

$stmt = $conn->prepare("SELECT id, name, quantity, category, created_at FROM products WHERE added_by = ? ORDER BY id DESC");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

$products = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode($products);

$conn->close();
?>
