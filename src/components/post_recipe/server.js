
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '.uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
}

);

const upload = multer({storage: storage});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title> Upload Recipes</title>
        </head>

        <body>
            <h1> Uploard Your Recipes Here</h1>
            <form id="uploadForm" enctype="multipart/form-data">
                <input type="file" id="mediaFile" name"media" accept="image/*,audio/*,video/*" required>
                <button type="submit">Upload</button>
            </form>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', function(event)) {
            event.preventDefault();
            let formData = new FormData();
            formData.append('media', document.getElementById('mediaFile'.files[0]);
            
            fetch('upload', {
            method: 'POST', 
            body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert('Recipe Upload successful!');
                console.error(error);
                });
            });
       
         </script>
         </body>
         </html>
 `);
});

app.post('/upload', upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', file: req.file});
});

const fs = require('fs');
const uploadDir = './uploads';
if(!fs.exists.Sync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:300');
});