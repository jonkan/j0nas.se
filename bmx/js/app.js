var progress = document.getElementById('progress');
var amountLoaded;
var totalAmount;
var fileLoaded;
var defaultCanvasWidth;
var defaultCanvasHeight;

var isWebGLSupported = function() {
	return !!window.WebGLRenderingContext && (!!canvas.getContext("webgl") || !!canvas.getContext("experimental-webgl"));
};

var getFile =function(id, filename, doneCallback) {
	var req = new XMLHttpRequest();
	// report progress events
	req.addEventListener("progress", function(event) {
		if (event.lengthComputable) {
			totalAmount[id] = event.total;
		}

		amountLoaded[id] = event.loaded;

		var loaded = 0;
		var total = 0;

		for (var i = 0; i < amountLoaded.length; i++) {
			loaded += amountLoaded[i];
			total += totalAmount[i];
		}

		var percentComplete = loaded / total;
		console.log("Progress: " + percentComplete);
		var progress = document.getElementById('progress');
		progress.hidden = false;
		progress.value = 100*percentComplete;
	}, false);

	// load responseText into a new script element
	req.addEventListener("loadend", doneCallback, false);
	//req.onload = doneCallback;
	req.open("GET", filename, true);
	req.send();
};

var finishedLoading = function() {
	var allDone = true;
	for (var i = 0; i < fileLoaded.length; i++) {
		allDone= allDone && fileLoaded[i];
	}
	if (allDone) {
		console.log("All files loaded");
		progress.hidden = true;
		canvas.hidden = false;
	}
};

window.onresize = function(event) {
	var width = document.getElementById('canvas-container').clientWidth;
	var height = document.getElementById('canvas-container').clientHeight;
	Module.setCanvasSize(width, height);
};

// connect to canvas
var Module = {
	preRun: (function() {

		if (!isWebGLSupported()) {
			console.log("WebGL not supported");
			var d = document.createElement("div");
			d.id = "canvas-status";
			d.innerHTML = "Ouch.. Your browser does not seem to support WebGL";
			document.getElementById("canvas-container").appendChild(d);
			return;
		}

		amountLoaded = [0, 0];
		totalAmount = [9336888, 2364951];
		fileLoaded = [false, false];

		getFile(0, "SketchyBMX.data", function() {
			fileLoaded[0] = true;
			finishedLoading();
		});
		getFile(1, "SketchyBMX.js", function() {
			var s = document.createElement("script");
			s.innerHTML = this.responseText;
			document.documentElement.appendChild(s);
			fileLoaded[1] = true;
			finishedLoading();
		});
	})(),

	postRun: [],
	print: [],

	printErr: function(text) {
		text = Array.prototype.slice.call(arguments).join(' ');
		console.log(text);
	},

	canvas: document.getElementById('canvas'),

	totalDependencies: 0,
	monitorRunDependencies: function(left) {
		//console.log("monitorRunDependencies:" + left);
		this.totalDependencies = Math.max(this.totalDependencies, left);
	},
	toggleFillWindow: function() {
		var container = document.getElementById('container');
		var canvasContainer = document.getElementById('canvas-container');
		if (container.className == 'container') {
			container.className = 'fill-window';
			canvasContainer.className = 'fill-window';
			document.getElementById('fillWindowButton').value = 'Restore window';
			defaultCanvasWidth = canvas.width;
			defaultCanvasHeight = canvas.height;
			var width = document.getElementById('canvas-container').clientWidth;
			var height = document.getElementById('canvas-container').clientHeight;
			Module.setCanvasSize(width, height);

		} else {
			container.className = 'container';
			canvasContainer.className = 'canvas-container';
			document.getElementById('fillWindowButton').value = 'Fill window';
			canvas.width = defaultCanvasWidth;
			canvas.height = defaultCanvasHeight;
		}
	}
};
