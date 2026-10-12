const input = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\r?\n/);

const [rows, columns] = input[0]
    .split(/\s+/)
    .map(Number);

const forest = input
    .slice(1)
    .map(line => [...line.trim()]);

const visited = Array.from(
    { length: rows },
    () => Array(columns).fill(false)
);

function isLuminousTree(row, column) {
    return (
        row >= 0 &&
        row < rows &&
        column >= 0 &&
        column < columns &&
        forest[row][column] === "1"
    );
}

function illuminateColony(initialRow, initialColumn) {
    const pending = [{
        row: initialRow,
        column: initialColumn
    }];

    let pointer = 0;
    let colonySize = 0;

    visited[initialRow][initialColumn] = true;

    while (pointer < pending.length) {
        const current = pending[pointer++];
        colonySize++;

        const neighbors = [
            [current.row - 1, current.column],
            [current.row + 1, current.column],
            [current.row, current.column - 1],
            [current.row, current.column + 1]
        ];

        for (const [nextRow, nextColumn] of neighbors) {
            if (
                isLuminousTree(nextRow, nextColumn) &&
                visited[nextRow][nextColumn] === false
            ) {
                visited[nextRow][nextColumn] = true;

                pending.push({
                    row: nextRow,
                    column: nextColumn
                });
            }
        }
    }

    return colonySize;
}

let colonies = 0;
const colonySizes = [];

for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
        if (
            forest[row][column] === "1" &&
            !visited[row][column]
        ) {
            colonies += 1;
            colonySizes.push(illuminateColony(row, column));
        }
    }
}

process.stdout.write(String(colonies));