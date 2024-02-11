const express = require("express");

const app = express();
const upload = require("./upload");

const { spawn, exec } = require("child_process");

const gm = require("gm");
const fs = require("fs");
const imageMagick = gm.subClass({ imageMagick: "7+" });

const crypto = require("crypto");

function randomNumber(min, max) {
	return Math.random() * (max - min) + min;
}

app.use(express.json());

app.post("/upload", upload.single("file"), (req, res) => {
	const storageData = fs.readFileSync("data.json");
	const jsonData = JSON.parse(storageData);

	jsonData[Date.now()] = {
		title: req.body.title,
		description: req.body.description,
		// random between -20 and -10 or 10 and 20
		frame_angle:
			randomNumber(0, 2) > 1 ? randomNumber(10, 20) : randomNumber(-20, -10),
		// or any other data we want to add in that object
	};

	fs.writeFileSync("data.json", JSON.stringify(jsonData, null, 4));

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
});

app.get("/gallery", (req, res) => {
	const storageData = fs.readFileSync("data.json");
	const jsonData = JSON.parse(storageData);
	res.send(jsonData);
});

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
