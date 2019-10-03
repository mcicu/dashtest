var video;

var mp4boxfile = MP4Box.createFile();

mp4boxfile.onMoovStart = function () {
    console.log("Starting to receive File Information");
}

mp4boxfile.onReady = function (info) {
	var ms = video.ms;
	if (info.isFragmented) {
		ms.duration = info.fragment_duration/info.timescale;
	} else {
		ms.duration = info.duration/info.timescale;
	}
}

downloader = new Downloader();
downloader.setUrl("videos/SampleVideo_1280x720_1mb.mp4");
downloader.setChunkSize(10000);
downloader.setInterval(500);
downloader.setCallback(
    function (response, end, error) {
        var nextStart = 0;
        if (response) {
        	console.log("Downloaded : " + Math.ceil(100 * downloader.chunkStart / downloader.totalLength) + " %");
            nextStart = mp4boxfile.appendBuffer(response, end);
        }
        if (end) {
            console.log("Download complete");
            mp4boxfile.flush();
        } else {
            downloader.setChunkStart(nextStart);
        }
        if (error) {
            reset();
            console.log("Download error");
        }
    })

window.onload = function() {
	video = document.getElementById("v");
	var mediaSource = new MediaSource();
	mediaSource.video = video;
	video.ms = mediaSource;
	video.src = window.URL.createObjectURL(mediaSource);
}