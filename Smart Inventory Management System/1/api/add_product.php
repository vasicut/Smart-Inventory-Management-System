<?php
header('Content-Type: application/json');
require 'db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && isset($data->quantity) && !empty($data->category) && !empty($data->added_by)) {
    $name = htmlspecialchars(strip_tags($data->name));
    $quantity = intval($data->quantity);
    $category = htmlspecialchars(strip_tags($data->category));
    $added_by = htmlspecialchars(strip_tags($data->added_by));

    $stmt = $conn->prepare("INSERT INTO products (name, quantity, category, added_by) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("siss", $name, $quantity, $category, $added_by);

    if ($stmt->execute()) {
        echo json_encode([
          "success" => true,
          "message" => "Product was added successfully!"
        ]);
    } else {
        echo json_encode([
          "success" => false,
          "message" => "Failed to add product.",
          "error" => $stmt->error
        ]);
    }

    $stmt->close();
} else {
    echo json_encode([
      "success" => false,
      "message" => "Invalid input."
    ]);
}

$conn->close();
?>
