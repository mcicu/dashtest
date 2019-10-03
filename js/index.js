
var mp4boxfile = MP4Box.createFile();

mp4boxfile.onMoovStart = function () {
	console.log("Starting to receive File Information");
}

mp4boxfile.onReady = function (info) {
	console.log("Received File Information");
}