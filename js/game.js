var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 576; // 144 * 4
canvas.height = 256;
document.body.appendChild(canvas);
//bg image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";
//bird image
var birdReady = false;
var birdImage = new Image();
birdImage.onload = function()
{
	birdReady=true;
}
birdImage.src="images/bird.png";
//first upper bar
var upper1Ready=false;
var upper1Image = new Image();
upper1Image.onload = function() {
	upper1Ready=true;
}
upper1Image.src="images/upper.png";

//second upper bar
var upper2Ready=false;
var upper2Image = new Image();
upper2Image.onload = function() {
	upper2Ready=true;
}
upper2Image.src="images/upper.png";

//third upper bar
var upper3Ready=false;
var upper3Image = new Image();
upper3Image.onload = function() {
	upper3Ready=true;
}
upper3Image.src="images/upper.png";

//first lower bar
var lower1Ready=false;
var lower1Image = new Image();
lower1Image.onload = function() {
	lower1Ready=true;
}
lower1Image.src="images/lower.png";

//second lower bar
var lower2Ready=false;
var lower2Image = new Image();
lower2Image.onload = function() {
	lower2Ready=true;
}
lower2Image.src="images/lower.png";

//third lower bar
var lower3Ready=false;
var lower3Image = new Image();
lower3Image.onload = function() {
	lower3Ready=true;
}
lower3Image.src="images/lower.png";

var bird = {
	xspeed : 0,
	yspeed : 0,
	xacc : 0,
	yacc : 200,
	x : 2,
	y : 2,
	score : 0
};
// restore original pipe arrangement
var upper1 = {
	xspeed : -60,
	x : 80,
	y : -100
}
var upper2 = {
	xspeed : -60,
	x : 250,
	y : -50
}
var upper3 = {
	xspeed : -60,
	x : 420,
	y : -70
}

var lower1 = {
	xspeed : -60,
	x : 80,
	y : 150
}
var lower2 = {
	xspeed : -60,
	x : 250,
	y : 135
}
var lower3 = {
	xspeed : -60,
	x : 420,
	y : 160
}
var keysDown = {};

// Game Over state
var gameOver = false;
var tryAgainButton = {
	width: 160,
	height: 40,
	x: canvas.width / 2 - 80,
	y: canvas.height / 2 + 20
};

// add event listener for Try Again button
canvas.addEventListener("click", function(evt) {
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

//adding key listeners
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
	f=0;
}, false);

//function to reset game
var reset = function () {
	bird.xspeed=0;
	bird.yspeed=0;
	bird.x=0;
	bird.y=120;
	bird.score=0;
	// restore original pipe arrangement
	upper1.x = 80; upper1.y = -100;
	upper2.x = 250; upper2.y = -50;
	upper3.x = 420; upper3.y = -70;
	lower1.x = 80; lower1.y = 150;
	lower2.x = 250; lower2.y = 135;
	lower3.x = 420; lower3.y = 160;
};
var f=0;
var difficulty=-40;

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

	bird.score+=modifier;
	if (38 in keysDown && f==0) 
	{ // Player holding up
		bird.yspeed = -70; // less big jump
		f=1;
	}
	bird.x+=bird.xspeed * modifier;
	bird.y+=bird.yspeed * modifier;
	bird.xspeed+=bird.xacc * modifier;
	bird.yspeed+=bird.yacc * modifier;
	upper1.x=upper1.x + upper1.xspeed * modifier;
	upper2.x=upper2.x + upper2.xspeed * modifier;
	upper3.x=upper3.x + upper3.xspeed * modifier;
	lower1.x=lower1.x + lower1.xspeed * modifier;
	lower2.x=lower2.x + lower2.xspeed * modifier;
	lower3.x=lower3.x + lower3.xspeed * modifier;
	if (upper1.x<-25)
	{
		upper1.y=difficulty+10-Math.random()*50;
		upper1.x=canvas.width;
	}
	if (upper2.x<-25)
	{
		upper2.x=canvas.width;
		upper2.y=difficulty+10-Math.random()*50;
	}
	if (upper3.x<-25)
	{
		upper3.x=canvas.width;
		upper3.y=difficulty+10-Math.random()*50;	
	}	
	if (lower1.x<-25)
	{
		lower1.y=-difficulty+160-Math.random()*50;
		lower1.x=canvas.width;
	}
	if (lower2.x<-25)
	{
		lower2.x=canvas.width;
		lower2.y=-difficulty+160-Math.random()*50;
	}
	if (lower3.x<-25)
	{
		lower3.x=canvas.width;
		lower3.y=-difficulty+160-Math.random()*50;	
	}	

	// Improved collision detection using bounding boxes (bird: 16x16 for your sprite, pipes: 25x135 as before)
	const bw = 16, bh = 16, pw = 25, ph = 135;
	const pipes = [
		{ x: upper1.x, y: upper1.y },
		{ x: upper2.x, y: upper2.y },
		{ x: upper3.x, y: upper3.y },
		{ x: lower1.x, y: lower1.y },
		{ x: lower2.x, y: lower2.y },
		{ x: lower3.x, y: lower3.y }
	];
	for (let i=0; i<3; ++i) {
		// Upper pipes
		if (rectsCollide(bird.x, bird.y, bw, bh, pipes[i].x, pipes[i].y, pw, ph)) {
			endGame();
			return;
		}
	}
	for (let i=3; i<6; ++i) {
		// Lower pipes
		if (rectsCollide(bird.x, bird.y, bw, bh, pipes[i].x, pipes[i].y, pw, ph)) {
			endGame();
			return;
		}
	}
	// ground and ceiling
	if (bird.y > canvas.height-bh || bird.y < 0) {
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
	if (birdReady)
	{
		ctx.drawImage(birdImage,bird.x,bird.y);
	}
	if (upper1Ready)
	{
		ctx.drawImage(upper1Image,upper1.x,upper1.y);
	}
	if (upper2Ready)
	{
		ctx.drawImage(upper2Image,upper2.x,upper2.y);
	}
	if (upper3Ready)
	{
		ctx.drawImage(upper3Image,upper3.x,upper3.y);
	}
	if (lower1Ready)
	{
		ctx.drawImage(lower1Image,lower1.x,lower1.y);
	}
	if (lower2Ready)
	{
		ctx.drawImage(lower2Image,lower2.x,lower2.y);
	}
	if (lower3Ready)
	{
		ctx.drawImage(lower3Image,lower3.x,lower3.y);
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
