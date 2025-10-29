var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 576; // 144 * 4
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

// Pipe variables
var PIPE_COUNT = 6;
var PIPE_GAP = 90;      // smaller gap (was 135)
var PIPE_SPEED = -60;   // faster pipes (was -30)
var PIPE_WIDTH = 25;    // approximate width of a pipe image
var PIPE_SPAWN_DISTANCE = Math.floor(canvas.width / PIPE_COUNT);

// Arrays for pipes
var uppers = [];
var lowers = [];

// Initialize pipes, spread them evenly
for (let i = 0; i < PIPE_COUNT; i++) {
    let xPos = 80 + i * PIPE_SPAWN_DISTANCE;
    let upperY = -100 + Math.random() * 60;
    let lowerY = upperY + PIPE_GAP + 100; // 100 is the height of the pipe image
    uppers.push({ xspeed: PIPE_SPEED, x: xPos, y: upperY });
    lowers.push({ xspeed: PIPE_SPEED, x: xPos, y: lowerY });
}

var keysDown = {};
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    f = 0;
}, false);

//function to reset game
var reset = function () {
    bird.xspeed = 0;
    bird.yspeed = 0;
    bird.x = 0;
    bird.y = 120;
    bird.score = 0;
    for (let i = 0; i < PIPE_COUNT; i++) {
        let xPos = 80 + i * PIPE_SPAWN_DISTANCE;
        let upperY = -100 + Math.random() * 60;
        let lowerY = upperY + PIPE_GAP + 100;
        uppers[i].x = xPos; uppers[i].y = upperY;
        lowers[i].x = xPos; lowers[i].y = lowerY;
    }
};
var f = 0;
var difficulty = -40;
// function that is called a lot
var update = function (modifier) {
    bird.score += modifier;
    if (38 in keysDown && f == 0) { // Player holding up
        bird.yspeed = -100;
        f = 1;
    }
    bird.x += bird.xspeed * modifier;
    bird.y += bird.yspeed * modifier;
    bird.xspeed += bird.xacc * modifier;
    bird.yspeed += bird.yacc * modifier;

    // Move pipes and respawn if off screen
    for (let i = 0; i < PIPE_COUNT; i++) {
        uppers[i].x += uppers[i].xspeed * modifier;
        lowers[i].x += lowers[i].xspeed * modifier;
        if (uppers[i].x < -PIPE_WIDTH) {
            let newUpperY = difficulty + 10 - Math.random() * 50;
            uppers[i].y = newUpperY;
            uppers[i].x = canvas.width;
            lowers[i].y = newUpperY + PIPE_GAP + 100;
            lowers[i].x = canvas.width;
        }
    }

    // collision detection
    if (bird.y > canvas.height) reset();
    for (let i = 0; i < PIPE_COUNT; i++) {
        // Upper pipe collision
        if (
            uppers[i].x < bird.x + 15 && uppers[i].x + PIPE_WIDTH > bird.x && bird.y < uppers[i].y + 90
        ) {
            reset();
        }
        // Lower pipe collision
        if (
            lowers[i].x < bird.x + 15 && lowers[i].x + PIPE_WIDTH > bird.x && bird.y > lowers[i].y - 10
        ) {
            reset();
        }
    }
};

//function to render on the screen
var render = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
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
    ctx.fillText("score: " + bird.score, 12, 32);
};

// the main loop of the game
var main = function () {
    var now = Date.now();
    var delta = now - then;
    update(delta / 1000);
    render();
    then = now;
    requestAnimationFrame(main);
};
var then = Date.now();
reset();
main();
