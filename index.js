const { Server } = require("socket.io");

const express = require("express");

const app = express();
var cors = require("cors");
app.use(cors());
// const upload = require("./upload");

const { spawn, exec } = require("child_process");

const gm = require("gm");
const fs = require("fs");
const imageMagick = gm.subClass({ imageMagick: "7+" });

const Jimp = require("jimp");

const crypto = require("crypto");

function randomNumber(min, max) {
	return Math.random() * (max - min) + min;
}

app.use(express.static("storage"));
app.use(express.json({ limit: "15mb" }));
// app.use(express.urlencoded({ limit: "10mb" }));

// const io = new Server(3002, {
// 	path: "/",
// 	cors: {
// 		origin: `*`,
// 	},
// });

// io.on("connection", (socket) => {
// 	const { channel } = socket.handshake.auth;

// 	if (!channel) {
// 		socket.disconnect();

// 		return;
// 	}

// 	socket.join(channel);
// });

app.post("/upload", async (req, res) => {
	const fileBuffer = Buffer.from(req.body.file, "base64");

	if (fileBuffer.length > 8 * 1024 * 1024) {
		return res.status(400).json({ message: "File is too large" });
	}

	let fileExtension = "";

	if (fileBuffer.toString("hex").startsWith("ffd8ff")) {
		fileExtension = "jpg";
	} else {
		if (fileBuffer.toString("hex").startsWith("89504e47")) {
			fileExtension = "png";
		}
	}

	if (fileExtension === "") {
		return res.status(400).json({ message: "Invalid file type" });
	}

	const fileMD5 = crypto.createHash("md5").update(fileBuffer).digest("base64");

	if (fileMD5 !== req.body.fileInfo.hash) {
		return res.status(400).json({ message: "File is corrupted" });
	}

	const storageData = fs.readFileSync("data.json");
	const jsonData = JSON.parse(storageData);
	const timestamp = Date.now();

	console.log(req.body.title);

	jsonData[timestamp] = {
		title: req.body.title,
		description: req.body.description,
		// random between -20 and -10 or 10 and 20
		frame_angle:
			randomNumber(0, 2) > 1 ? randomNumber(0, 5) : randomNumber(-5, -0),
		// or any other data we want to add in that object
	};

	fs.writeFileSync("data.json", JSON.stringify(jsonData, null, 4));

	// Publish to new images channel

	// io.to("new-images").emit("new-image");

	// const fileUUID = uuid();
	// const filePath = path.join(
	// 	process.cwd(),
	// 	"tmp",
	// 	`${fileUUID}.${fileExtension}`
	// );

	const filePath = `storage/${timestamp}.${fileExtension}`;

	fs.writeFileSync(filePath, fileBuffer);

	const image = await Jimp.read(fileBuffer);

	image.crop(
		req.body.fileInfo.cropArea.x,
		req.body.fileInfo.cropArea.y,
		req.body.fileInfo.cropArea.width,
		req.body.fileInfo.cropArea.height
	);
	// image.resize(256, Jimp.AUTO);–

	const newFileBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

	// fs.unlinkSync(filePath);
	fs.writeFileSync(filePath, newFileBuffer);

	// Handle the uploaded file
	res.json({ message: "File uploaded successfully!" });

	const command = `python convert.py ${filePath} ${
		filePath.split(".")[0]
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

		// Publish image name to channel processed images
		// io.to("processed-images").emit("image-processed", {
		// 	image: `${filePath.split(".")[0]}-polaroid.png`,
		// 	timestamp,
		// });
	});
});

app.get("/gallery", (req, res) => {
	const storageData = fs.readFileSync("data.json");
	const jsonData = JSON.parse(storageData);
	res.send(jsonData);
});

app.get("/home", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
