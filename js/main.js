'use strict';

// canvas width and height: 320x320
const CELL_PIXEL_WIDTH = 2;
const CELL_PIXEL_HEIGHT = 2;
const CELL_WIDTH = 160;
const CELL_HEIGHT = 160;

const CELL_ALIVE = 1;
const CELL_DEAD = 0;

const BOARD_WIDTH = CELL_WIDTH + 2;
const BOARD_HEIGHT = CELL_HEIGHT + 2;
const LIVE_RATIO = 0.35;
const BACKGROUND_COLOR = '#000000';
const FPS = 15; // 10..60 (https://pixijs.download/dev/docs/PIXI.Ticker.html#maxFPS)

let board = undefined;
let neighbors = undefined;
let app = undefined;
let graphics = undefined;
let output = undefined;
let live_color = '#11d319'; // default is green


document.getElementById('start').onclick = function() {
  let button = document.getElementById('start');
  if (button.textContent == 'Start') {
    button.textContent = 'Pause';
    live_color =  document.getElementById('color').value;
    app.ticker.add(gameloop);
  } else {
    button.textContent = "Start"
    app.ticker.remove(gameloop);
  }
}

document.getElementById('regenerate').onclick = function() {
  app.ticker.addOnce(regenerate);
}

function shuffle() {
  for (let i = board.length - 2; i >= 1; i--) {
    for (let j = board[i].length - 2; j >= 1; j--) {
      let rand = Math.floor(Math.random() * (j + 1) + 1)
      let tmp = board[i][j]
      board[i][j] = board[i][rand]
      board[i][rand] = tmp
    }
  }
}

function gameloop() {
  output.innerText = `Current FPS: ${app.ticker.FPS.toFixed(3)}`;
  graphics.clear();
  nextGeneration();
  draw();
}

function regenerate() {
  live_color =  document.getElementById('color').value;

  if (app.ticker.started) {
    document.getElementById('start').textContent = "Start";
    app.ticker.remove(gameloop);
  }

  for (let i = 1; i < BOARD_WIDTH - 1; i++) {
    for (let j = 1; j < BOARD_HEIGHT - 1; j++) {
      board[i][j] = CELL_DEAD;
    }
  }
  init_board();
  shuffle();
  graphics.clear();
  draw();
}

function draw() {
  graphics.beginFill(live_color);
  for (let i = 1; i < BOARD_WIDTH - 1; i++) {
    for (let j = 1; j < BOARD_HEIGHT - 1; j++) {
      if (board[i][j] == CELL_ALIVE) {
        graphics.drawRect((i - 1) * CELL_PIXEL_WIDTH, (j - 1) * CELL_PIXEL_HEIGHT, CELL_PIXEL_WIDTH, CELL_PIXEL_HEIGHT);
      }
    }
  }
  graphics.endFill();
}

function countNeighbors(i, j) {
  // top-left
  return board[i-1][j-1] +
    // top-middle
    board[i-1][j] +
    // top-right
    board[i-1][j+1] +
    // middle-left
    board[i][j-1] +
    // middle-right
    board[i][j+1] +
    // bottom-left
    board[i+1][j-1] +
    // bottom-middle
    board[i+1][j] +
    // bottom-right
    board[i+1][j+1];
}

function nextGeneration() {
  for (let i = 1; i < BOARD_WIDTH - 1; i++) {
    for (let j = 1; j < BOARD_HEIGHT - 1; j++) {
      neighbors[i][j] = countNeighbors(i, j);
    }
  }

  for (let i = 1; i < BOARD_WIDTH - 1; i++) {
    for (let j = 1; j < BOARD_HEIGHT - 1; j++) {
      switch (neighbors[i][j]) {
        case 2:
          break;
        case 3:
          board[i][j] = CELL_ALIVE;
          break;
        default:
          board[i][j] = CELL_DEAD;
      }
    }
  }

}

function init_board() {
  for (let i = 1; i < BOARD_WIDTH - 1; i++) {
    for (let j = 1; j < Math.round(CELL_HEIGHT * LIVE_RATIO); j++) {
      board[i][j] = CELL_ALIVE;
    }
  }
}

function main() {
  app = new PIXI.Application({
    width: CELL_PIXEL_WIDTH * CELL_WIDTH,
    height: CELL_PIXEL_HEIGHT * CELL_HEIGHT,
    view: canvas,
    backgroundColor: BACKGROUND_COLOR,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);

  output = document.querySelector("#fps");
  app.ticker.maxFPS = FPS;

  // board init
  board = Array(BOARD_WIDTH);
  for (let i = 0; i < BOARD_WIDTH; i++) {
    board[i] = Array(BOARD_HEIGHT).fill(0);
  }

  init_board();

  // neighbors init
  neighbors = Array(BOARD_WIDTH);
  for (let i = 0; i < BOARD_WIDTH; i++) {
    neighbors[i] = Array(BOARD_HEIGHT).fill(0);
  }

  shuffle();

  app.ticker.addOnce(() => {
    draw();
  });
}

window.onload = main;
