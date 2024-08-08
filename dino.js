//version
const version = "v1.04";

//board
let board;
let boardWidth = 750;
let boardHeight = 250;
let context;

//dino
let dinoWidth = 70;
let dinoHeight = 80;
let dinoX = 180;
let dinoY = boardHeight - dinoHeight;
let dinoImg;

let dino = {
  x: dinoX,
  y: dinoY,
  width: dinoWidth,
  height: dinoHeight,
};

//cactus
let cactusArray = [];

let cactus1Width = 50;
let cactus2Width = 69;
let cactus3Width = 60;

let cactusHeight = 70;
let cactus3Height = 200;
let cactusX = 700;
let cactusY = boardHeight - cactusHeight;

let cactus1Img;
let cactus2Img;
let cactus3Img;

//background
let backgroundImg;

//physics
let velocityX = -8; //cactus moving left speed
let velocityY = 0;
let gravity = 1;

let gameOver = false;
let gameStarted = false;
let score = 0;
const targetScore = 500;
const hideMessageScore = 1000;
let successSoundPlayed = false;

//sound
let baseUrl = "https://leopangea.github.io/dodo-run-pangea/";
let JumpSound = new Audio(baseUrl + "sound/newjump.mp3");
JumpSound.volume = 0.3;

let GameOverSound = new Audio(baseUrl + "sound/game-over-arcade-6435.mp3");

let WinSound = new Audio(baseUrl + "sound/success-fanfare-trumpets-6185.mp3");

let backgroundMusic = new Audio(baseUrl + "sound/wild-west-background-194954.mp3");
backgroundMusic.volume = 0.1;
backgroundMusic.loop = true;

//touch/no touch
let isTouchDevice = false;

//speed
let lastTime = 0;
let speedFactor = 1; // Game speed factor, adjust this to change the game speed

window.onload = function () {
  console.log(version);
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d"); //used for drawing on the board

  dinoImg = new Image();
  dinoImg.src = baseUrl + "img/gamedodonew.png";
  dinoImg.onload = function () {
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
  };

  cactus1Img = new Image();
  cactus1Img.src = baseUrl + "img/palmtree.png";

  cactus2Img = new Image();
  cactus2Img.src = baseUrl + "img/volcano.png";

  cactus3Img = new Image();
  cactus3Img.src = baseUrl + "img/Copy of Untitled Design.png";

  backgroundImg = new Image();
  backgroundImg.src = baseUrl + "img/newback.png";

  // Display the start message
  context.font = "20px courier";
  context.fillText("Press SPACE or TAP to start the game", 250, 125);

  // add event listener for keyboard (desktop)
  document.addEventListener("keydown", handleKeyDown);
  // add event listener for touch
  board.addEventListener("touchstart", moveDinoTouch);
};

function startGame() {
  gameStarted = true;
  backgroundMusic.play();
  requestAnimationFrame(update);
  setInterval(placeCactus, 1000); //1000 milliseconds = 1 second
}

function update(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }
  const deltaTime = (timestamp - lastTime) / 1000; // convert to seconds
  lastTime = timestamp;

  if (!gameOver) {
    context.clearRect(0, 0, board.width, board.height);

    // Draw background
    context.drawImage(backgroundImg, 0, 0, board.width, board.height);

    //dino
    velocityY += gravity;
    dino.y = Math.min(dino.y + velocityY * deltaTime * 50 * speedFactor, dinoY); // apply gravity to current dino.y, making sure it doesn't exceed the ground
    context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    //cactus
    for (let i = 0; i < cactusArray.length; i++) {
      let cactus = cactusArray[i];
      cactus.x += velocityX * deltaTime * 50 * speedFactor;
      context.drawImage(cactus.img, cactus.x, cactus.y, cactus.width, cactus.height);

      if (detectCollision(dino, cactus)) {
        gameOver = true;
        dinoImg.src = baseUrl + "img/deadgamedodo.png";
        dinoImg.onload = function () {
          context.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
        };
        GameOverSound.play();
        backgroundMusic.pause();
      }
    }

    //score
    context.fillStyle = "black";
    context.font = "20px courier";
    score++;
    context.fillText(score, 5, 20);

    const message = document.getElementById('message');
    if (score >= targetScore && score < hideMessageScore) {
      message.style.display = 'block';
      if (!successSoundPlayed) {
        WinSound.play();
        successSoundPlayed = true;
      }
    } else if (score >= hideMessageScore) {
      message.style.display = 'none';
      WinSound.pause();
      successSoundPlayed = false;
    }

    if (gameOver) {
      context.font = "90px";
      context.fillText("GAME OVER", 420, 130, 180);
      context.font = "30px";
      context.fillText("Press 'SPACE' or TAP to restart", 340, 150, 240);
    }
  }

  requestAnimationFrame(update);
}

function handleKeyDown(e) {
  if (!gameStarted) {
    if (e.code === "Space") {
      startGame();
    }
    return;
  }
  if (gameOver) {
    if (e.code === "Space") {
      restartGame();
    }
    return;
  }

  moveDino(e);
}

function moveDinoTouch(e) {
  isTouchDevice = true;
  console.log("isTouchDevice:" + isTouchDevice);

  if (!gameStarted) {
    startGame();
  }

  if (gameOver) {
    restartGame();
    // return;
  }

  if (dino.y === dinoY) {
    //jump
    velocityY = -23;
  } else {
    //duck
  }
}

function moveDino(e) {
  if ((e.code === "Space" || e.code === "ArrowUp") && dino.y === dinoY) {
    //jump
    velocityY = -20;
    JumpSound.play();
  } else if (e.code === "ArrowDown" && dino.y === dinoY) {
    //duck
  }
}

function placeCactus() {
  if (gameOver) {
    return;
  }

  //place cactus
  let cactus = {
    img: null,
    x: cactusX,
    y: cactusY,
    width: null,
    height: cactusHeight,
  };

  let placeCactusChance = Math.random(); //0 - 0.9999...

  if (placeCactusChance > 0.9) {
    //10% you get cactus3
    cactus.img = cactus3Img;
    cactus.width = cactus3Width;
    cactusArray.push(cactus);
  } else if (placeCactusChance > 0.7) {
    //30% you get cactus2
    cactus.img = cactus2Img;
    cactus.width = cactus2Width;
    cactusArray.push(cactus);
  } else if (placeCactusChance > 0.5) {
    //50% you get cactus1
    cactus.img = cactus1Img;
    cactus.width = cactus1Width;
    cactusArray.push(cactus);
  }

  if (cactusArray.length > 5) {
    cactusArray.shift(); //remove the first element from the array so that the array doesn't constantly grow
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y
  ); //a's bottom left corner passes b's top left corner
}

function restartGame() {
  gameOver = false;
  score = 0;
  velocityY = 0;
  dino.y = dinoY;
  cactusArray = [];
  dinoImg.src = baseUrl + "img/gamedodonew.png";
  backgroundMusic.play();
  const message = document.get
}
