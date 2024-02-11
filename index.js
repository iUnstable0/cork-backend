const express = require("express");

const app = express();
const upload = require("./upload");

const { spawn, exec } = require("child_process");

const gm = require("gm");
const fs = require("fs");
const imageMagick = gm.subClass({ imageMagick: "7+" });

const crypto = require("crypto");

app.use(express.json());

app.post("/upload", upload.single("file"), (req, res) => {
	// Handle the uploaded file
	res.json({ message: "File uploaded successfully!" });

	const command = `python convert.py ${req.file.path} ${
		req.file.path.split(".")[0]
	}-polaroid.png`;

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
		console.log("Image processing complete");
	});

	// const options = [
	// 	req.file.path,
	// 	"-background",
	// 	"none",
	// 	"-polaroid",
	// 	"5", // Adjusts the rotation angle for a more natural look. Change as needed.
	// 	"-bordercolor",
	// 	"white", // Sets the border color to white.
	// 	"-border",
	// 	"6", // Adjusts the border size. You can increase/decrease this value.
	// 	`${req.file.path.split(".")[0]}-polaroid.png`, // The output file with a modified name to reflect the polaroid effect.
	// ];

	// console.log(`convert ${options.join(" ")}`);
	// spawn(`convert`, options);
});

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
