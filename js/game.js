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
var BIRD_WIDTH = 34, BIRD_HEIGHT = 24; // Adjust to your image size
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
var PIPE_GAP = 90;
var PIPE_SPEED = -60;
var PIPE_WIDTH = 25;
var PIPE_HEIGHT = 100; // Adjust to your image size
var PIPE_SPAWN_DISTANCE = Math.floor(canvas.width / PIPE_COUNT);

// Arrays for pipes
var uppers = [];
var lowers = [];

// Game state
var gameOver = false;
var tryAgainButton = {
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 + 20,
    width: 100,
    height: 30
};

function initPipes() {
    uppers = [];
    lowers = [];
    for (let i = 0; i < PIPE_COUNT; i++) {
        let xPos = 80 + i * PIPE_SPAWN_DISTANCE;
        let upperY = -100 + Math.random() * 60;
        let lowerY = upperY + PIPE_GAP + PIPE_HEIGHT;
        uppers.push({ xspeed: PIPE_SPEED, x: xPos, y: upperY });
        lowers.push({ xspeed: PIPE_SPEED, x: xPos, y: lowerY });
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
        var mouseX = evt.clientX - rect.left;
        var mouseY = evt.clientY - rect.top;
        if (
            mouseX >= tryAgainButton.x && mouseX <= tryAgainButton.x + tryAgainButton.width &&
            mouseY >= tryAgainButton.y && mouseY <= tryAgainButton.y + tryAgainButton.height
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
    initPipes();
};
var f = 0;
var difficulty = -40;
// function that is called a lot
var update = function (modifier) {
    bird.score += modifier;
    if (38 in keysDown && f == 0) { // Player holding up
        bird.yspeed = -70; // LESS BIG JUMP!
        f = 1;
    }
    bird.x += bird.xspeed * modifier;
    bird.y += bird.yspeed * modifier;
    bird.xspeed += bird.xacc * modifier;
    bird.yspeed += bird.yacc * modifier;

    for (let i = 0; i < PIPE_COUNT; i++) {
        uppers[i].x += uppers[i].xspeed * modifier;
        lowers[i].x += lowers[i].xspeed * modifier;
        if (uppers[i].x < -PIPE_WIDTH) {
            let newUpperY = difficulty + 10 - Math.random() * 50;
            uppers[i].y = newUpperY;
            uppers[i].x = canvas.width;
            lowers[i].y = newUpperY + PIPE_GAP + PIPE_HEIGHT;
            lowers[i].x = canvas.width;
        }
    }

    // collision detection (rectangle-based, more accurate)
    for (let i = 0; i < PIPE_COUNT; i++) {
        // Upper pipe collision
        if (
            bird.x < uppers[i].x + PIPE_WIDTH &&
            bird.x + BIRD_WIDTH > uppers[i].x &&
            bird.y < uppers[i].y + PIPE_HEIGHT &&
            bird.y + BIRD_HEIGHT > uppers[i].y
        ) {
            endGame();
            return;
        }
        // Lower pipe collision
        if (
            bird.x < lowers[i].x + PIPE_WIDTH &&
            bird.x + BIRD_WIDTH > lowers[i].x &&
            bird.y < lowers[i].y + PIPE_HEIGHT &&
            bird.y + BIRD_HEIGHT > lowers[i].y
        ) {
            endGame();
            return;
        }
    }
    // ground
    if (bird.y > canvas.height - BIRD_HEIGHT || bird.y < 0) {
        endGame();
        return;
    }
};

function endGame() {
    gameOver = true;
    render(); // Draw the final state
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
        ctx.drawImage(birdImage, bird.x, bird.y, BIRD_WIDTH, BIRD_HEIGHT);
    }
    for (let i = 0; i < PIPE_COUNT; i++) {
        if (upperPipeReady) {
            ctx.drawImage(upperPipeImage, uppers[i].x, uppers[i].y, PIPE_WIDTH, PIPE_HEIGHT);
        }
        if (lowerPipeReady) {
            ctx.drawImage(lowerPipeImage, lowers[i].x, lowers[i].y, PIPE_WIDTH, PIPE_HEIGHT);
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
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    // Draw Try Again button
    ctx.fillStyle = "#00aaff";
    ctx.fillRect(tryAgainButton.x, tryAgainButton.y, tryAgainButton.width, tryAgainButton.height);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Helvetica";
    ctx.fillText("Try Again", canvas.width / 2, tryAgainButton.y + 22);
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
