document.addEventListener('DOMContentLoaded', function () {
    loadExistingFolders();
});

function loadExistingFolders() {
    fetch('indexer.php?action=loadFolders')
        .then(response => response.json())
        .then(data => {
            const albumSection = document.getElementById('album-section');
            albumSection.innerHTML = '';
            data.folders.forEach(folder => {
                const folderElement = document.createElement('div');
                folderElement.className = 'folder col-sm-3 col-md-2';
                folderElement.innerHTML = `
                    <img src="fpic2.png" alt="Folder Icon" onclick="openFolder('${folder}')">
                    <div class="folder-name">${folder}</div>
                    <button class=" remove btn btn-danger btn-sm mt-2" onclick="deleteFolder('${folder}')"> remove Folder</button>
                `;
                albumSection.appendChild(folderElement);
            });
        });
}

function createFolder() {
    const folderName = document.getElementById('folderName').value;
    if (folderName) {
        fetch(`indexer.php?action=checkFolder&folder=${folderName}`)
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    alert('Folder already exists!');
                } else {
                    fetch('indexer.php?action=createFolder', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ folder: folderName })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            loadExistingFolders(); 
                            document.getElementById('folderName').value = ''; 
                        } else {
                            alert('Failed to create folder');
                        }
                    });
                }
            });
    } else {
        alert('Please enter a folder name');
    }
}

function deleteFolder(folderName) {
    if (confirm(`Are you sure you want to delete the  "${folderName}" folder?`)) {
        fetch('indexer.php?action=deleteFolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder: folderName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadExistingFolders();
            } else {
                alert('Failed to delete folder');
            }
        });
    }
}

function openFolder(folderName) {
    currentFolder = folderName;
    document.getElementById('create-folder-section').classList.add('d-none');
    document.getElementById('existing-folders').classList.add('d-none');
    document.getElementById('photos-section').classList.remove('d-none');

    loadPhotos(folderName);
}

function goBack() {
    document.getElementById('create-folder-section').classList.remove('d-none');
    document.getElementById('existing-folders').classList.remove('d-none');
    document.getElementById('photos-section').classList.add('d-none');
}

function loadPhotos(folderName) {
    fetch(`indexer.php?action=loadPhotos&folder=${folderName}`)
        .then(response => response.json())
        .then(data => {
            const photoGallery = document.getElementById('photo-gallery');
            photoGallery.innerHTML = '';
            data.photos.forEach(photo => {
                const photoElement = document.createElement('div');
                photoElement.className = 'photo col-sm-3 col-md-2';
                photoElement.innerHTML = `
                    <img src="${photo.url}" alt="Photo" onclick="showFullScreenImage('${photo.url}')">
                    <div class="photo-name">${photo.name}</div>
                    
                   <button class="btn btn-danger btn-sm mt-2" onclick="deleteImage('${photo.name}')">Delete Image</button> 
                `;
                photoGallery.appendChild(photoElement);
            });
        });
}


function deleteImage(imageName) {
    if (confirm(`Are you sure you want to delete the image "${imageName}"?`)) {
        fetch('indexer.php?action=deleteImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ folder: currentFolder, image: imageName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadPhotos(currentFolder);
            } else {
                alert('Failed to delete image');
            }
        });
    }
}

function uploadImage() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', currentFolder);

        fetch('indexer.php?action=checkImage', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                alert('Image already exists!');
            } else {
                fetch('indexer.php?action=uploadImage', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadPhotos(currentFolder);
                        fileInput.value = '';
                    } else {
                        alert('Failed to upload image');
                    }
                });
            }
        });
    } else {
        alert('Please select an image to upload');
    }
}

function showFullScreenImage(url) {
    document.getElementById('photos-section').classList.add('d-none');
    const fullScreenImage = document.getElementById('full-screen-image');
    fullScreenImage.classList.remove('d-none');
    document.getElementById('full-image').src = url;
}

function closeFullScreenImage() {
    document.getElementById('photos-section').classList.remove('d-none');
    const fullScreenImage = document.getElementById('full-screen-image');
    fullScreenImage.classList.add('d-none');
    document.getElementById('full-image').src = '';
}
