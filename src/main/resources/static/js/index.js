var video;

var mp4boxfile = MP4Box.createFile();

mp4boxfile.onMoovStart = function () {
    console.log("Starting to receive file information");
}

mp4boxfile.onReady = function (info) {
	console.log("Received file information");
	var ms = video.ms;
	if (info.isFragmented) {
		ms.duration = info.fragment_duration/info.timescale;
	} else {
		ms.duration = info.duration/info.timescale;
	}

	addSourceBufferListener(info);
}

downloader = new Downloader();
downloader.setUrl("videos/jwplayer.mp4");
downloader.setChunkSize(10000);
downloader.setInterval(500);
downloader.setCallback(
    function (response, end, error) {
        var nextStart = 0;
        if (response) {
            nextStart = mp4boxfile.appendBuffer(response, end);
        }
        if (end) {
            console.
            mp4boxfile.flush();
        } else {
			downloader.setChunkStart(nextStart);
		}
		if (error) {
            reset();
        }
    })

window.onload = function() {
	video = document.getElementById("v");
	var mediaSource = new MediaSource();
	mediaSource.video = video;
	video.ms = mediaSource;
	video.src = window.URL.createObjectURL(mediaSource);
}

function addSourceBufferListener(info) {
	for (var i = 0; i < info.tracks.length; i++) {
		var track = info.tracks[i];
		var checkBox = document.getElementById("addTrack"+track.id);
		if (!checkBox) continue;
		checkBox.addEventListener("change", (function (t) {
			return function (e) {
				var check = e.target;
				if (check.checked) {
					addBuffer(video, t);
				} else {
					removeBuffer(video, t.id);
				}
			};
		})(track));
	}
}

function addBuffer(video, mp4track) {
	var sb;
	var ms = video.ms;
	var track_id = mp4track.id;
	var codec = mp4track.codec;
	var mime = 'video/mp4; codecs=\"'+codec+'\"';
	var kind = mp4track.kind;
	var trackDefault;
	var trackDefaultSupport = (typeof TrackDefault !== "undefined");
	var html5TrackKind = "";
	if (codec == "wvtt") {
		if (!kind.schemeURI.startsWith("urn:gpac:")) {
			html5TrackKind = "subtitles";
		} else {
			html5TrackKind = "metadata";
		}
	} else {
		if (kind && kind.schemeURI === "urn:w3c:html5:kind") {
			html5TrackKind = kind.value || "";
		}
	}
	if (trackDefaultSupport) {
		if (mp4track.type === "video" || mp4track.type === "audio") {
			trackDefault = new TrackDefault(mp4track.type, mp4track.language, mp4track.name, [ html5TrackKind ], track_id);
		} else {
			trackDefault = new TrackDefault("text", mp4track.language, mp4track.name, [ html5TrackKind ], track_id);
		}
	}
	if (MediaSource.isTypeSupported(mime)) {
		try {

			sb = ms.addSourceBuffer(mime);
			if (trackDefaultSupport) {
				sb.trackDefaults = new TrackDefaultList([trackDefault]);
			}
			sb.addEventListener("error", function(e) {

			});
			sb.ms = ms;
			sb.id = track_id;
			mp4boxfile.setSegmentOptions(track_id, sb, { nbSamples: parseInt(segmentSizeLabel.value) } );
			sb.pendingAppends = [];
		} catch (e) {

		}
	} else {

		var i;
		var foundTextTrack = false;
		for (i = 0; i < video.textTracks.length; i++) {
			var track = video.textTracks[i];
			if (track.label === 'track_'+track_id) {
				track.mode = "showing";
				track.div.style.display = 'inline';
				foundTextTrack = true;
				break;
			}
		}
		if ((!foundTextTrack) && (html5TrackKind !== "")) {
			var texttrack = video.addTextTrack(html5TrackKind, mp4track.name, mp4track.language);
			texttrack.id = track_id;
			texttrack.mode = "showing";
			mp4boxfile.setExtractionOptions(track_id, texttrack, { nbSamples: parseInt(extractionSizeLabel.value) });
			texttrack.codec = codec;
			texttrack.mime = codec.substring(codec.indexOf('.')+1);
			texttrack.mp4kind = mp4track.kind;
			texttrack.track_id = track_id;
			var div = document.createElement("div");
			div.id = "overlay_track_"+track_id;
			div.setAttribute("class", "overlay");
			overlayTracks.appendChild(div);
			texttrack.div = div;
			initTrackViewer(texttrack);
		}
	}
}