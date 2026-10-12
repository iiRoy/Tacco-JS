const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const verticalSize = Number(transmission.shift());
const horizontalSize = Number(transmission.shift());

const alienPanel = [];

for (let row = 0; row < verticalSize; row++) {
    alienPanel.push(
        transmission.splice(0, horizontalSize)
    );
}

const visitedCells = Array.from(
    { length: verticalSize },
    () => new Array(horizontalSize).fill(false)
);

const verticalMovement = [0, 1, 0, -1];
const horizontalMovement = [1, 0, -1, 0];

let currentRow = 0;
let currentColumn = 0;
let direction = 0;

const recoveredMessage = [];

for (
    let step = 0;
    step < verticalSize * horizontalSize;
    step++
) {
    recoveredMessage.push(
        alienPanel[currentRow][currentColumn]
    );

    visitedCells[currentRow][currentColumn] = true;

    let nextRow =
        currentRow + verticalMovement[direction];

    let nextColumn =
        currentColumn + horizontalMovement[direction];

    const outsideChamber =
        nextRow < 0 ||
        nextRow >= verticalSize ||
        nextColumn < 0 ||
        nextColumn >= horizontalSize;

    if (
        outsideChamber ||
        visitedCells[nextRow][nextColumn]
    ) {
        direction = (direction + 1) % 4;

        nextRow =
            currentRow + verticalMovement[direction];

        nextColumn =
            currentColumn + horizontalMovement[direction];
    }

    currentRow = nextRow;
    currentColumn = nextColumn;
}

console.log(recoveredMessage.join(' '));