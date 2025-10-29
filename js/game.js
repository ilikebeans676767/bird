var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 576;
canvas.height = 256;
document.body.appendChild(canvas);

// Images
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () { bgReady = true; };
bgImage.src = "images/background.png";

var birdReady = false;
var birdImage = new Image();
birdImage.onload = function () { birdReady = true; };
birdImage.src = "images/bird.png";

var upperPipeReady = false;
var upperPipeImage = new Image();
upperPipeImage.onload = function () { upperPipeReady = true; };
upperPipeImage.src = "images/upper.png";

var lowerPipeReady = false;
var lowerPipeImage = new Image();
lowerPipeImage.onload = function () { lowerPipeReady = true; };
lowerPipeImage.src = "images/lower.png";

// Bird
var bird = {
	xspeed: 0,
	yspeed: 0,
	xacc: 0,
	yacc: 200,
	x: 2,
	y: 2,
	score: 0
};

var PIPE_COUNT = 6; // Start with 6 pipes for higher difficulty
var PIPE_GAP = 60;
var PIPE_WIDTH = 25, PIPE_HEIGHT = 135; // Original pipe dimensions
var PIPE_SPAWN_DISTANCE = Math.floor(canvas.width / PIPE_COUNT);
var INITIAL_PIPE_SPEED = -105;
var pipeSpeed = INITIAL_PIPE_SPEED;
var pipesPassed = 0;

// Arrays for upper and lower pipes
var uppers = [];
var lowers = [];

// Game Over state
var gameOver = false;
var tryAgainButton = {
	width: 160,
	height: 40,
	x: canvas.width / 2 - 80,
	y: canvas.height / 2 + 20
};

// Helper for random Y positions
function randomUpperY() {
	return -40 - Math.random() * 70;
}

function initPipes() {
	uppers = [];
	lowers = [];
	// Spread pipes evenly across the canvas
	for (let i = 0; i < PIPE_COUNT; i++) {
		let xPos = 80 + i * PIPE_SPAWN_DISTANCE;
		let upperY = randomUpperY();
		let lowerY = upperY + PIPE_GAP + PIPE_HEIGHT;
		uppers.push({ xspeed: pipeSpeed, x: xPos, y: upperY, counted: false });
		lowers.push({ xspeed: pipeSpeed, x: xPos, y: lowerY });
	}
}

initPipes();

var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	f = 0;
}, false);

// Listen for mouse clicks for "Try Again" button
canvas.addEventListener("click", function (evt) {
	if (gameOver) {
		var rect = canvas.getBoundingClientRect();
		var mx = evt.clientX - rect.left;
		var my = evt.clientY - rect.top;
		if (
			mx >= tryAgainButton.x &&
			mx <= tryAgainButton.x + tryAgainButton.width &&
			my >= tryAgainButton.y &&
			my <= tryAgainButton.y + tryAgainButton.height
		) {
			reset();
			gameOver = false;
			then = Date.now();
			main();
		}
	}
}, false);

//function to reset game
var reset = function () {
	bird.xspeed = 0;
	bird.yspeed = 0;
	bird.x = 0;
	bird.y = 120;
	bird.score = 0;
	pipeSpeed = INITIAL_PIPE_SPEED;
	pipesPassed = 0;
	initPipes();
};

var f = 0;
var difficulty = -40;

// collision helper: axis-aligned bounding box
function rectsCollide(rx, ry, rw, rh, sx, sy, sw, sh) {
	return (
		rx < sx + sw &&
		rx + rw > sx &&
		ry < sy + sh &&
		ry + rh > sy
	);
}

// function that is called a lot
var update = function (modifier) 
{
	if (gameOver) return;

	bird.score += modifier;
	if (38 in keysDown && f == 0) { // Player holding up
		bird.yspeed = -80; // less big jump
		f = 1;
	}
	bird.x += bird.xspeed * modifier;
	bird.y += bird.yspeed * modifier;
	bird.xspeed += bird.xacc * modifier;
	bird.yspeed += bird.yacc * modifier;

	for (let i = 0; i < PIPE_COUNT; i++) {
		uppers[i].x += pipeSpeed * modifier;
		lowers[i].x += pipeSpeed * modifier;
		// Respawn pipes that move off the left of the screen
		if (uppers[i].x < -PIPE_WIDTH) {
			uppers[i].y = randomUpperY();
			uppers[i].x = canvas.width;
			uppers[i].counted = false;
			lowers[i].y = uppers[i].y + PIPE_GAP + PIPE_HEIGHT;
			lowers[i].x = canvas.width;
		}

		// Only count once per pipe set, when it passes the bird
		if (!uppers[i].counted && uppers[i].x + PIPE_WIDTH < bird.x) {
			pipesPassed++;
			uppers[i].counted = true;
			// Every 6 pipes passed, increase speed
			if (pipesPassed % 4 === 0) {
				pipeSpeed -= 60; // Increase speed by 5 (more negative is faster)
			}
		}
	}

	// Improved collision detection using bounding boxes (bird: 16x16 for your sprite, pipes: 25x135 as before)
	const bw = 16, bh = 16, pw = PIPE_WIDTH, ph = PIPE_HEIGHT;
	for (let i = 0; i < PIPE_COUNT; ++i) {
		// Upper pipes
		if (rectsCollide(bird.x, bird.y, bw, bh, uppers[i].x, uppers[i].y, pw, ph)) {
			endGame();
			return;
		}
		// Lower pipes
		if (rectsCollide(bird.x, bird.y, bw, bh, lowers[i].x, lowers[i].y, pw, ph)) {
			endGame();
			return;
		}
	}
	// ground and ceiling
	if (bird.y > canvas.height - bh || bird.y < 0) {
		endGame();
		return;
	}
};

function endGame() {
	gameOver = true;
	render();
	drawGameOver();
}

//function to render on the screen
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	} else {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	if (birdReady) {
		ctx.drawImage(birdImage, bird.x, bird.y);
	}
	for (let i = 0; i < PIPE_COUNT; i++) {
		if (upperPipeReady) {
			ctx.drawImage(upperPipeImage, uppers[i].x, uppers[i].y);
		}
		if (lowerPipeReady) {
			ctx.drawImage(lowerPipeImage, lowers[i].x, lowers[i].y);
		}
	}
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("score: " + Math.floor(bird.score), 12, 32);

	if (gameOver) {
		drawGameOver();
	}
};

function drawGameOver() {
	ctx.save();
	ctx.globalAlpha = 0.7;
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1.0;

	ctx.fillStyle = "#fff";
	ctx.font = "bold 40px Helvetica";
	ctx.textAlign = "center";
	ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

	// Black button, white text, centered
	ctx.fillStyle = "#000";
	ctx.fillRect(tryAgainButton.x, tryAgainButton.y, tryAgainButton.width, tryAgainButton.height);
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 3;
	ctx.strokeRect(tryAgainButton.x, tryAgainButton.y, tryAgainButton.width, tryAgainButton.height);

	ctx.fillStyle = "#fff";
	ctx.font = "22px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Try Again", canvas.width / 2, tryAgainButton.y + tryAgainButton.height / 2);
	ctx.restore();
}

// the main loop of the game
var then = Date.now();
function main() {
	if (gameOver) return;
	var now = Date.now();
	var delta = now - then;
	update(delta / 1000);
	render();
	then = now;
	requestAnimationFrame(main);
}
reset();
main();
