<?php

function checkFolder($folder) {
    $folderPath = 'photos/' . $folder;
    return file_exists($folderPath);
}

function checkImage($folder, $image) {
    $imagePath = 'photos/' . $folder . '/' . $image;
    return file_exists($imagePath);
}

function createFolder($folder) {
    $folderPath = 'photos/' . $folder;
    return mkdir($folderPath);
}

function deleteFolder($folder) {
    $folderPath = 'photos/' . $folder;
    $files = glob($folderPath . '/*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    return rmdir($folderPath);
}

function loadFolders() {
    $folders = array_filter(glob('photos/*'), 'is_dir');
    return array_map('basename', $folders);
}

function loadPhotos($folder) {
    $folderPath = 'photos/' . $folder;
    $files = array_filter(glob($folderPath . '/*'), 'is_file');
    $photos = [];
    foreach ($files as $file) {
        $photos[] = ['name' => basename($file), 'url' => $file];
    }
    return $photos;
}

function deleteImage($folder, $image) {
    $imagePath = 'photos/' . $folder . '/' . $image;
    return unlink($imagePath);
}

function uploadImage($folder) {
    // Set the default timezone to Indian Standard Time (IST)
    date_default_timezone_set('Asia/Kolkata');
    
    // Define the target directory and file path
    $targetDir = 'photos/' . $folder . '/';
    
    // Get the original file name
    $originalFileName = basename($_FILES['file']['name']);
    
    // Get the current date and time in the format YYYYMMDD_HHMMSS
    $dateTime = new DateTime();
    $formattedDateTime = $dateTime->format('Ymd_His');
    
    // Create a new file name with the timestamp
    $newFileName = $formattedDateTime . '_' . $originalFileName;
    $targetFile = $targetDir . $newFileName;
    
    // Move the uploaded file to the target directory
    return move_uploaded_file($_FILES['file']['tmp_name'], $targetFile);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'checkFolder':
        $folder = $_GET['folder'] ?? '';
        echo json_encode(['exists' => checkFolder($folder)]);
        break;

    case 'checkImage':
        $folder = $_POST['folder'] ?? '';
        $image = basename($_FILES['file']['name'] ?? '');
        echo json_encode(['exists' => checkImage($folder, $image)]);
        break;

    case 'createFolder':
        $data = json_decode(file_get_contents('php://input'), true);
        $folder = $data['folder'] ?? '';
        echo json_encode(['success' => createFolder($folder)]);
        break;

    case 'deleteFolder':
        $data = json_decode(file_get_contents('php://input'), true);
        $folder = $data['folder'] ?? '';
        echo json_encode(['success' => deleteFolder($folder)]);
        break;

    case 'loadFolders':
        echo json_encode(['folders' => loadFolders()]);
        break;

    case 'loadPhotos':
        $folder = $_GET['folder'] ?? '';
        echo json_encode(['photos' => loadPhotos($folder)]);
        break;

    case 'deleteImage':
        $data = json_decode(file_get_contents('php://input'), true);
        $folder = $data['folder'] ?? '';
        $image = $data['image'] ?? '';
        echo json_encode(['success' => deleteImage($folder, $image)]);
        break;

    case 'uploadImage':
        $folder = $_POST['folder'] ?? '';
        echo json_encode(['success' => uploadImage($folder)]);
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}








