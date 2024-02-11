const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + ".png");
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;
