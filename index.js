const express = require("express");

const app = express();
const upload = require('./upload');

const { spawn } = require('child_process');

const gm = require('gm');
const fs = require('fs');
const imageMagick = gm.subClass({ imageMagick: "7+" });

const crypto = require("crypto")


app.use(express.json());

app.post('/upload', upload.single('file'), (req, res) => {

  // Handle the uploaded file
  res.json({ message: 'File uploaded successfully!' });

  spawn(`convert ${req.file.path} -polaroid 0 ${req.file.path.split(".")[0]}-processed.png`)

  // imageMagick()
  // .command("convert")
  // // .in("-caption",  "mycaption")
  // .in('"' + req.file.path + '"')
  // // .in("-thumbnail",  "250x250")
  // .in("polaroid", "0")
  //  // insert other options...
  // .write(`"${req.file.path.split(".")[0]}_processed.png"`, function (err) {
  //    if (err) return console.log(err);
  // });
  
});

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
