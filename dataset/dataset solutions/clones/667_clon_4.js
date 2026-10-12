const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const verticalSize = transmission.shift();
const horizontalSize = transmission.shift();

let coolingBarrier = 0;

const previousRow = new Array(horizontalSize).fill(0);

for (let row = 0; row < verticalSize; row++) {
    let leftCell = 0;

    for (let column = 0; column < horizontalSize; column++) {
        const currentCell = transmission.shift();

        if (currentCell === 1) {
            coolingBarrier += 4;

            if (leftCell === 1) {
                coolingBarrier -= 2;
            }

            if (previousRow[column] === 1) {
                coolingBarrier -= 2;
            }
        }

        previousRow[column] = currentCell;
        leftCell = currentCell;
    }
}

console.log(coolingBarrier);