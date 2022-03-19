// VARIABLES

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const lengthDisplay = document.getElementById("lengthDisplay");
const recordDisplay = document.getElementById("recordDisplay");
const levelDisplay = document.getElementById("levelDisplay");
const hardDisplay = document.getElementById("hardDisplay");
const projDisplay = document.getElementById("projDisplay");
const appleSound = document.getElementById("appleSound");
const blockSound = document.getElementById("blockSound");

const printOffset = 1;
const canvasSize = canvas.width;
const blockSize = 40;
const blockFrequency = 100;
const appleFrequency = 250;
const speed = 80;
const blockedElements = [];
const coords = [];

let moveCounter;
let projMode = false;
let hardMode = false;
let apple;
let direction;
let lengthRecord = 1;
let firstTime = true;

const colorArray = [
    "#00FF00",
    "#00FFFF",
    "#FFFF00",
    "#FF8000",
    "#A0A0A0",
    "#402D6B",
    "#082008",
    "#9ACD32",
    "#FFC0CB",
    "#FF0000",
];

const DIRECTION = {
    left: -1,
    right: +1,
    up: -2,
    down: +2,
};

// START SCREEN

function displayStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press any key to start the game", 400, 400);
    document.addEventListener("keydown", start);
}

displayStartScreen();

// START FUNCTION

function start() {
    document.removeEventListener("keydown", start);
    document.addEventListener("keydown", (e) => keyControl(e));
    restart();
}

// RESTART FUNCTION

function restart() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    moveCounter = 1;
    blockedElements.length = 0;
    coords.length = 0;
    coords.push([0, 0]);
    printCoord(coords[0], colorArray[0]);
    createApple();
    direction = DIRECTION.right;
    if (firstTime) setInterval(move, speed);
    firstTime = false;
}

// KEY CONTROL

function keyControl(e) {
    switch (e.key) {
        case "ArrowDown":
            changeDirection(DIRECTION.down);
            break;
        case "ArrowUp":
            changeDirection(DIRECTION.up);
            break;
        case "ArrowLeft":
            changeDirection(DIRECTION.left);
            break;
        case "ArrowRight":
            changeDirection(DIRECTION.right);
            break;
        case "Enter":
            restart();
            break;
        case "h":
        case "H":
            hardMode = !hardMode;
            hardDisplay.innerText = hardMode ? "on" : "off";
            break;
        case "p":
        case "P":
            projMode = !projMode;
            projDisplay.innerText = projMode ? "on" : "off";
            break;
    }
}

function changeDirection(dir) {
    if (dir + direction === 0 && coords.length > 1) return;
    direction = dir;
}

// MOVE FUNCTION

function move() {
    moveCounter++;
    const head = computeNewHead();
    if (contains(coords.concat(blockedElements), head)) {
        restart();
    } else {
        coords.unshift(head);
        if (equalCoord(head, apple)) {
            printCoord(head, "purple");
            createApple();
            lengthRecord = Math.max(lengthRecord, coords.length);
        } else {
            const tail = coords.pop();
            printCoord(tail, "black");
            printCoord(head, snakeColor());
        }
        lengthDisplay.innerText = coords.length;
        recordDisplay.innerText = lengthRecord;
        levelDisplay.innerText = getLevel();

        if (hardMode) {
            if (moveCounter % blockFrequency === 0) {
                const block = randomElement(
                    allowedCoords(coords.concat([apple]).concat(blockedElements))
                );
                printCoord(block, "grey");
                blockedElements.push(block);
                blockSound.play();
            }
            if (moveCounter % appleFrequency === 0) {
                printCoord(apple, "black");
                createApple();
            }
        }
    }
}

// COMPUTE NEW HEAD

function projTransform(x) {
    return projMode ? canvasSize - blockSize - x : x;
}

function computeNewHead() {
    const head = coords[0];
    switch (direction) {
        case DIRECTION.down:
            return head[1] + blockSize >= canvasSize
                ? [projTransform(head[0]), 0]
                : [head[0], head[1] + blockSize];
        case DIRECTION.up:
            return head[1] - blockSize < 0
                ? [projTransform(head[0]), canvasSize - blockSize]
                : [head[0], head[1] - blockSize];
        case DIRECTION.left:
            return head[0] - blockSize < 0
                ? [canvasSize - blockSize, projTransform(head[1])]
                : [head[0] - blockSize, head[1]];
        case DIRECTION.right:
            return head[0] + blockSize >= canvasSize
                ? [0, projTransform(head[1])]
                : [head[0] + blockSize, head[1]];
    }
}

// CREATE APPLE

function createApple() {
    apple = randomElement(allowedCoords(coords.concat(blockedElements)));
    appleSound.play();
    ctx.fillStyle = "red";
    ctx.fillRect(
        apple[0] + printOffset,
        apple[1] + printOffset,
        blockSize - 2 * printOffset,
        blockSize - 2 * printOffset
    );
}

// DRAW FUNCTION

function printCoord(coord, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        coord[0] + printOffset,
        coord[1] + printOffset,
        blockSize - 2 * printOffset,
        blockSize - 2 * printOffset
    );
}

// LEVEL FUNCTION

function getLevel() {
    return 1 + Math.floor(coords.length / 10);
}

function snakeColor() {
    const index = (getLevel() - 1) % colorArray.length;
    return colorArray[index];
}

// AUXILIARY FUNCTIONS

function allowedCoords(list) {
    const L = [];
    for (let i = 0; i < canvasSize / blockSize; i++) {
        for (let j = 0; j < canvasSize / blockSize; j++) {
            const coord = [i * blockSize, j * blockSize];
            if (!contains(list, coord)) {
                L.push(coord);
            }
        }
    }
    return L;
}

function contains(list, el) {
    return list.some((e) => equalCoord(e, el));
}

function equalCoord(c, d) {
    return c[0] === d[0] && c[1] === d[1];
}

function randomElement(list) {
    let index = Math.floor(Math.random() * list.length);
    return list[index];
}
