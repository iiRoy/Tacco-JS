const fs = require('fs');

const tokens = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const rows = Number(tokens[0]);
const columns = Number(tokens[1]);

let tokenIndex = 2;

const matrix = Array.from(
    { length: rows },
    () => Array.from(
        { length: columns },
        () => tokens[tokenIndex++]
    )
);

let top = 0;
let bottom = rows - 1;
let left = 0;
let right = columns - 1;

const message = [];

while (top <= bottom && left <= right) {
    for (let column = left; column <= right; column++) {
        message.push(matrix[top][column]);
    }

    top++;

    for (let row = top; row <= bottom; row++) {
        message.push(matrix[row][right]);
    }

    right--;

    if (top <= bottom) {
        for (let column = right; column >= left; column--) {
            message.push(matrix[bottom][column]);
        }

        bottom--;
    }

    if (left <= right) {
        for (let row = bottom; row >= top; row--) {
            message.push(matrix[row][left]);
        }

        left++;
    }
}

console.log(message.join(' '));