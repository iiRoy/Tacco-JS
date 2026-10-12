const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const rows = data[0];
const columns = data[1];

let cursor = 2;

const terrain = Array.from(
    { length: rows },
    () => Array.from(
        { length: columns },
        () => data[cursor++]
    )
);

const visited = Array.from(
    { length: rows },
    () => new Array(columns).fill(false)
);

const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

function explore(row, column) {
    if (
        row < 0 ||
        row >= rows ||
        column < 0 ||
        column >= columns
    ) {
        return 1;
    }

    if (terrain[row][column] === 0) {
        return 1;
    }

    if (visited[row][column]) {
        return 0;
    }

    visited[row][column] = true;

    let perimeter = 0;

    for (const [rowChange, columnChange] of directions) {
        perimeter += explore(
            row + rowChange,
            column + columnChange
        );
    }

    return perimeter;
}

let totalPerimeter = 0;

for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
        if (
            terrain[row][column] === 1 &&
            !visited[row][column]
        ) {
            totalPerimeter += explore(row, column);
        }
    }
}

console.log(totalPerimeter);