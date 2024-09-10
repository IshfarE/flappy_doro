//board
let board;
let boardWidth = 1600;
let boardHeight = 640;
let context;

//Define audio
var audio = new Audio('./roblox_oof.mp3');
var levelup = new Audio('./score_up.mp3');
var jump = new Audio('./jump_fx.mp3');

//doro
let doroWidth = 55;     //width/height ratio: 704/612 = 176/153 => 55/48 (rounded to nearest pixel)
let doroHeight = 48;
let doroX = boardWidth/8;
let doroY = boardHeight/2;
let doroImg;

let doro = {
    x : doroX,
    y : doroY,
    width : doroWidth,
    height : doroHeight
}

//bricks
let brickArray = [];
let brickWidth = 64;  //width/height ratio: 75/600 = 1/8
let brickHeight = 512;
let brickX = boardWidth;
let brickY = 0;

let topBrickImg;
let bottomBrickImg;

//physics
let velocityX = -2;  //Bricks move left speed (negative x value)
let velocityY = 0; //doro jump speed
let gravity = 0.1; //Gravity to bring the doro down after every jump

let gameOver = false;
let score = 0;
let scoreHigh = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //draw on board

    //draw Flappy doro
    //load Images
    doroImg = new Image();
    doroImg.src = "./flappydoro.png";
    doroImg.onload = function() {
        context.drawImage(doroImg,doro.x,doro.y,doro.width,doro.height);
    }

    topBrickImg = new Image();
    topBrickImg.src = "./topbrick.png";

    bottomBrickImg = new Image();
    bottomBrickImg.src = "./bottombrick.png";
    
    requestAnimationFrame(update);
    setInterval(placeBricks, 1500); //Each brick is seen every 1.5 seconds
    document.addEventListener("keydown", movedoro); 
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0,0,board.width,board.height);

    //doro
    velocityY += gravity;
    doro.y = Math.max(doro.y + velocityY, 0); //Apply gravity to current doro.y, lock doro from top of canvas
    context.drawImage(doroImg,doro.x,doro.y,doro.width,doro.height);

    if (doro.y > board.height) {      //If the Doro falls down, end game right away
        gameOver = true;
    }

    //bricks
    for (let i = 0; i < brickArray.length; i++) {
        let brick = brickArray[i];
        brick.x += velocityX;
        context.drawImage(brick.img,brick.x,brick.y,brick.width,brick.height);

        if (!brick.passed && doro.x > brick.x + brick.width) {
            score += 0.5; //2 bricks per level, so 1/2 = 0.5

            brick.passed = true;
            levelup.play();
            
        }
        if (scoreHigh <= score) {       //Increase high score whenever it is less than or equal to current score
            scoreHigh = score;
        }
        if (detectCollision(doro, brick)) {
            gameOver = true;
            doroImg.src = "./flappydorodead.png"; //Change Doro avatar to game over phase
        }
    }

    //Clear bricks (prevent memory issues)
    while (brickArray.length > 0 && brickArray[0].x < -brickWidth) {
        brickArray.shift(); //Remove first element from brick array
    }


    //Score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText("Score: " + score, 5, 45);
    context.fillText("High score:" + scoreHigh, 5, 90);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 135);
        audio.play();
    }
    
}

function placeBricks() {
    if (gameOver) {
        return;
    }

    //(Value between 0 and 1) * brickHeight/2 -> Upward shift range
    //If Math.random returns 0: -128 (brickHeight/4)
    //If Math.random returns 1: -128 - 256 (brickHeight/4 - brickHeight/2) = -384 (-3/4 brickHeight)
    let randomBrickY = brickY - brickHeight/4 - Math.random()*(brickHeight/2);
    let openingSpace = board.height/4;

    let topBrick = {
        img : topBrickImg,
        x : brickX,
        y : randomBrickY,
        width : brickWidth,
        height : brickHeight,
        passed : false         //Check to see if flappy doro passed the brick (set to false as default)
    }

    brickArray.push(topBrick);

    let bottomBrick = {
        img : bottomBrickImg,
        x : brickX,
        y : randomBrickY + brickHeight + openingSpace,
        width : brickWidth,
        height : brickHeight,
        passed : false         //Check to see if flappy doro passed the brick (set to false as default)
    }

    brickArray.push(bottomBrick);
}

function movedoro(e) {
    if (e.code == "Space" || e.code == "ArrowUp" ||e.code == "KeyW") {
        //doro jump
        velocityY = -4;
        jump.play();

        //reset game (restore game back to start state)
        if (gameOver) {
            doro.y = doroY;
            brickArray = [];
            score = 0;
            gameOver = false;
            doroImg.src = "./flappydoro.png";
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && 
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}