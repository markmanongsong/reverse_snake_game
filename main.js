/////////////////////////////////
//Code for canvas, snake, block
////////////////////////////////
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
const pixel = 10;
const size = 600;
const backgroundCanvas = '#e9d8a6';
const borderCanvas = '#001219';
// Snakes
const snakeLength = 10;
const snakes = [];
// Player
const player = {
  positions: {
    x: 0,
    y: 0,
  },
  velocity: {
    horizontal: 0,
    vertical: 0,
  },
};
let gameInitialize = false;
let tickerTimer = 50;
let tickerTimerIncrement = 10;
let movementCounter = 1;
let score = 0;
let nextSnakeToAppear = 20;
let isGameOver = false;
let ticker;
let tickerMovement;
let tickerPlayer;
let tickerCollision;
let tickerScore;
let tickerSnakeAppearance;

const scoreElement = document.querySelector('.score span');
const movementCounterElement = document.querySelector('.movement-counter span');

const pickRandom = (collection) => {
  return collection[Math.floor(Math.random() * collection.length)];
};

const generateRandom = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createPosition = () => {
  const random = generateRandom(0, size);
  const centerAxis = size / 2;

  const rangeNumber = (size, startAt = size / 2) => {
    return [...Array(size).keys()].map((i) => i + startAt);
  };

  if (
    [
      ...rangeNumber(21, centerAxis),
      ...rangeNumber(21, centerAxis - 21),
    ].includes(random) ||
    random % pixel !== 0
  ) {
    return createPosition();
  }

  return random;
};

const createSnake = (length) => {
  let xAxis = size / 2;
  const yAxis = size / 2;
  const colors = [
    '#005F73',
    '#0A9396',
    '#94D2BD',
    '#EE9B00',
    '#CA6702',
    '#BB3E03',
    '#AE2012',
    '#9B2226',
  ];
  const getColor = (previousSnake) => {
    if (previousSnake) {
      const { color } = previousSnake;
      const searchColor = colors.indexOf(color);

      if (searchColor === -1) {
        return;
      }

      colors.splice(searchColor, 1);
    }

    return pickRandom(colors);
  };
  const positions = [];
  for (let i = 0; i < length; i++) {
    const snakeAxis = {
      x: (xAxis -= pixel),
      y: yAxis,
    };

    positions.push(snakeAxis);
  }

  const generateId = () => 'id-' + Math.random().toString(36).substring(2, 9);

  return {
    color: getColor(snakes[snakes.length - 1]),
    id: generateId(),
    positions,
    velocity: {
      horizontal: pixel,
      vertical: 0,
    },
  };
};

const changeTickerTimer = (operator, count = 10) => {
  if (tickerTimer <= 0) {
    return;
  }
  if (operator === 'reset') {
    tickerTimer = 60;

    return;
  }

  if (operator === 'increment') {
    tickerTimer += count;

    return;
  }

  tickerTimer -= count;
};

const drawSnakePart = (snakePart, color) => {
  context.fillStyle = color;
  context.strokestyle = borderCanvas;
  context.fillRect(snakePart.x, snakePart.y, pixel, pixel);
  context.strokeRect(snakePart.x, snakePart.y, pixel, pixel);
};

const drawSnake = (snake) => {
  snake.positions.forEach((part) => {
    drawSnakePart(part, snake.color);
  });

  return snake;
};

const clearCanvas = () => {
  context.fillStyle = backgroundCanvas;
  // context.strokestyle = borderCanvas;
  context.fillRect(0, 0, size, size);
  context.strokeRect(0, 0, size, size);
};

const moveSnake = (snake) => {
  const calculateHead = (position) => {
    const minimumPosition = 0;
    const maximumPosition = size - pixel;

    return position <= minimumPosition
      ? minimumPosition
      : position >= maximumPosition
      ? maximumPosition
      : position;
  };

  const { positions, velocity } = snake;

  const head = {
    x: calculateHead(positions[0].x + velocity.horizontal),
    y: calculateHead(positions[0].y + velocity.vertical),
  };

  positions.unshift(head);
  positions.pop();

  // console.log(
  // head,
  // positions.map((pos) => `x = ${pos.x}, y = ${pos.y}`),
  //   velocity
  // );
};

const isAboutToBump = (side, snake) => {
  const { positions } = snake;

  switch (side) {
    case 'right':
      return positions[0].x >= size - pixel;
    case 'left':
      return positions[0].x <= 0;
    case 'top':
      return positions[0].y <= 0;
    case 'bottom':
      return positions[0].y >= size - pixel;
    default:
      return false;
  }
};

const start = () => {
  if (gameInitialize) {
    throw 'Game already started';
  }

  gameInitialize = true;

  tick();
  tickMovement();
  tickCollision();
  tickScore();
  tickSnakeAppearance(generateRandom(500, 1000));
  // tickPlayer();
};

const tickMovement = () => {
  tickerMovement = setTimeout(() => {
    snakes.forEach(randomMovement);
    movementCounterElement.innerText = movementCounter++;

    tickMovement();
  }, 1000);
};

const stopTickMovement = () => {
  if (!tickerMovement) {
    return;
  }

  clearTimeout(tickerMovement);
};

const addSnake = (length = snakeLength) => {
  snakes.push(createSnake(length));
  const counter = document.querySelector('.snake-counter span');
  counter.innerText = snakes.length;
};

const tick = () => {
  snakes.forEach(checkIfAboutToBump);
  ticker = setTimeout(() => {
    main();
    snakes.forEach(moveSnake);
    movePlayer();
    tick();
  }, tickerTimer);
};

const tickCollision = () => {
  tickerCollision = setTimeout(() => {
    try {
      snakes.forEach(checkCollisionOfSnake);
    } catch (detail) {
      isGameOver = true;
      canvas.classList.add('game-over');
      document.dispatchEvent(new CustomEvent('stop', { detail }));

      return;
    }

    tickCollision();
  }, tickerTimer);
};

const checkIfAboutToBump = (snake) => {
  const isAboutToBumpVertically = () => {
    return isAboutToBump('bottom', snake) || isAboutToBump('top', snake);
  };
  const changeDirectionVertically = () => {
    changeDirection(isAboutToBump('bottom', snake) ? 'up' : 'down', snake);

    return;
  };
  const isAboutToBumpHorizontally = () => {
    return isAboutToBump('left', snake) || isAboutToBump('right', snake);
  };
  const changeDirectionHorizontally = () => {
    changeDirection(isAboutToBump('right', snake) ? 'left' : 'right', snake);

    return;
  };

  if (
    (isGoingToDirection('right', snake) && isAboutToBump('right', snake)) ||
    (isGoingToDirection('left', snake) && isAboutToBump('left', snake))
  ) {
    if (isAboutToBumpVertically()) {
      changeDirectionVertically();

      return;
    }

    changeDirection(pickRandom(['up', 'down']), snake);

    return;
  }
  if (
    (isGoingToDirection('up', snake) && isAboutToBump('top', snake)) ||
    (isGoingToDirection('down', snake) && isAboutToBump('bottom', snake))
  ) {
    if (isAboutToBumpHorizontally()) {
      changeDirectionHorizontally();

      return;
    }

    changeDirection(pickRandom(['left', 'right']), snake);

    return;
  }
};

const randomMovement = (snake) => {
  const directions = ['left', 'right', 'up', 'down'];

  if (isGoingToDirection('left', snake)) {
    directions.splice(directions.indexOf('right'), 1);
  }
  if (isGoingToDirection('right', snake)) {
    directions.splice(directions.indexOf('left'), 1);
  }
  if (isGoingToDirection('up', snake)) {
    directions.splice(directions.indexOf('down'), 1);
  }
  if (isGoingToDirection('down', snake)) {
    directions.splice(directions.indexOf('up'), 1);
  }

  const direction = pickRandom(directions);

  changeDirection(direction, snake);
};

const incrementScore = (element, score) => {
  element.innerText = score;
};

const tickScore = () => {
  tickerScore = setTimeout(() => {
    incrementScore(scoreElement, ++score);

    tickScore();
  }, 50);
};

const tickSnakeAppearance = (delay) => {
  nextSnakeToAppear = delay;
  tickerSnakeAppearance = setTimeout(() => {
    addSnake();

    tickSnakeAppearance(delay);
  }, delay);
};

const main = () => {
  clearCanvas();
  snakes.forEach(drawSnake);
  drawPlayer();
};

const stop = () => {
  gameInitialize = false;
  clearTimeout(ticker);
  clearTimeout(tickerMovement);
  clearTimeout(tickerPlayer);
  clearTimeout(tickerCollision);
  clearTimeout(tickerScore);
  clearTimeout(tickerSnakeAppearance);
};

const changeDirection = (direction, snake) => {
  const { velocity } = snake;

  switch (direction) {
    case 'up':
      Object.assign(velocity, { horizontal: 0, vertical: -pixel });
      break;
    case 'down':
      Object.assign(velocity, { horizontal: 0, vertical: pixel });
      break;
    case 'left':
      Object.assign(velocity, { horizontal: -pixel, vertical: 0 });
      break;
    case 'right':
      Object.assign(velocity, { horizontal: pixel, vertical: 0 });
      break;
  }
};

const isGoingToDirection = (direction, snake) => {
  const { velocity } = snake;

  switch (direction) {
    case 'up':
      return velocity.vertical === -pixel;
    case 'down':
      return velocity.vertical === pixel;
    case 'left':
      return velocity.horizontal === -pixel;
    case 'right':
      return velocity.horizontal === pixel;
    default:
      return false;
  }
};

const changeCanvasSize = () => {
  canvas.setAttribute('width', size);
  canvas.setAttribute('height', size);
};

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
    case 'ArrowLeft':
      changeDirection('left', player);
      break;
    case 'KeyD':
    case 'ArrowRight':
      changeDirection('right', player);
      break;
    case 'KeyW':
    case 'ArrowUp':
      changeDirection('up', player);
      break;
    case 'KeyS':
    case 'ArrowDown':
      changeDirection('down', player);
      break;
    // case 'Space':
    //   toggleGame();
    //   break;
    case 'KeyR':
      stop();
      reset();
      break;
  }
});

const toggleGame = () => {
  if (isGameOver) {
    reset();

    return;
  }

  if (gameInitialize) {
    stop();

    return;
  }

  start();
};

const drawPlayer = () => {
  const { positions } = player;

  context.fillStyle = '#FFFFFF';
  context.strokestyle = borderCanvas;
  context.fillRect(positions.x, positions.y, pixel, pixel);
  context.strokeRect(positions.x, positions.y, pixel, pixel);
};

const addPlayer = () => {
  Object.assign(player.positions, {
    x: createPosition(),
    y: createPosition(),
  });
};

const tickPlayer = () => {
  tickerPlayer = setTimeout(() => {
    main();
    movePlayer();

    tickPlayer();
  }, tickerTimer);
};

const changeDirectionPlayer = (direction) => {
  changeDirection(direction, player);
};

const movePlayer = () => {
  const calculateHead = (position) => {
    const minimumPosition = 0;
    const maximumPosition = size - pixel;

    return position <= minimumPosition
      ? minimumPosition
      : position >= maximumPosition
      ? maximumPosition
      : position;
  };

  const { positions, velocity } = player;
  const head = {
    x: calculateHead(positions.x + velocity.horizontal),
    y: calculateHead(positions.y + velocity.vertical),
  };

  Object.assign(positions, head);

  console.log(player.positions);
};

const CollisionException = function (snake, player) {
  this.snake = snake;
  this.player = player;
  this.name = 'CollisionException';
};

const checkCollisionOfSnake = (snake) => {
  const { positions } = player;

  const indexPosition = snake.positions.findIndex((position) => {
    return position.x === positions.x && position.y === positions.y;
  });

  if (indexPosition !== -1) {
    console.log('game-over'); 
    gameOver(); 
    throw new CollisionException(snake, player);
  }
};

const reset = () => {
  Object.assign(player, {
    positions: {
      x: 0,
      y: 0,
    },
    velocity: {
      horizontal: 0,
      vertical: 0,
    },
  });
  snakes.splice(0, snakes.length);
  nextSnakeToAppear = 20;
  movementCounter = 1;
  gameInitialize = false;
  isGameOver = false;
  score = 0;

  movementCounterElement.innerText = 0;
  incrementScore(scoreElement, 0);
  canvas.classList.remove('game-over');

  changeCanvasSize();
  addSnake(snakeLength);
  addPlayer();
  main();
};

document.addEventListener('stop', (e) => {
  console.log(e);
  stop();
});

document.getElementById('pause-or-play').addEventListener('click', () => {
  toggleGame();
});
document.getElementById('reset').addEventListener('click', () => {
  reset();
});
document.getElementById('add-snake').addEventListener('click', () => {
  addSnake();
});
['up', 'down', 'left', 'right'].forEach((direction) => {
  document
    .getElementById(`${direction}-button`)
    .addEventListener('click', () => {
      changeDirection(direction, player);
    });
});
// On load
(() => {
  changeCanvasSize();
  addSnake(snakeLength);
  addPlayer();
  main();
})();

/////////////////////////
//Code button click
////////////////////////

/**
 * to start the game button
 */
const clickStart = () => {
  document.getElementById('instruction').style.display = 'none';
  gameInAction = true;
  gamePauseResume();
};

/**
 * for pause Exit Button
 */
const clickPause = () => {
  document.getElementById('pause').style.display = 'block';
  gameInAction = false;
  gamePauseResume();
};

/**
 * for resume button
 */
const clickResume = () => {
  document.getElementById('pause').style.display = 'none';
  gameInAction = true;
  gamePauseResume();
};

/**
 * for close button
 */
const clickClose = () => {
  document.getElementById('controls').style.display = 'none';
  gameInAction = true;
  gamePauseResume();
};

/**
 * for pause and resume the game
 */
const gamePauseResume = () => {
  if (gameInAction === true) {
    console.log('game start');
    start();
    playMusic(BGM);
    //you can put code here
  }
  if (gameInAction === false) {
    console.log('game pause');
    stop();
    pauseMusic(BGM);
    //you can put code here
  }
};

/////////////////////
// music effects
////////////////////

// import background music
const BGM = new Audio('../assets/music/background.mp3');

// import background music
const GG = new Audio('../assets/music/game-over.mp3');

// import background music
const beep = new Audio('../assets/music/beep.mp3');

/**
 * play music
 * @param {string} audioInput
 */
const playMusic = (audioInput) => {
  audioInput.play();
  audioInput.volume = 0.2;
  audioInput.controls = true;
};

/**
 * pause music
 * @param {string} audioInput
 */
const pauseMusic = (audioInput) => {
  audioInput.pause();
};

/**
 * stop music
 * @param {string} audioInput
 */
const stopMusic = (audioInput) => {
  audioInput.pause();
  audioInput.currentTime = 0;
};

/////////////////////
//Game Over
////////////////////

const gameOver = () => {
  document.getElementById('game-over').style.display = 'block';
  gameInAction = false;
  gamePauseResume();
  playMusic(GG);
};

const tryAgain = () => {
  document.getElementById('game-over').style.display = 'none';
  gameInAction = true;
  gamePauseResume();
  stopMusic(GG);
  reset();
};

// pause or play code background should be pause
let pauseOrPlay = 0; // this is my comdition to make the button play or pause the button
document.getElementById('pause-or-play').addEventListener('click', function () {
  if (pauseOrPlay == 0) {
    // if button is equal to zero which is true this will satisfy the condition
    pauseOrPlay = 1; // assign new value to buttonNumClick

    BGM.pause();
  } else {
    pauseOrPlay = 0;
    BGM.play();
  }
});

// End of code for pause and play
