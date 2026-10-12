const input = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\r?\n/);

const [rows, columns] = input[0]
    .trim()
    .split(/\s+/)
    .map(Number);

const forest = input
    .slice(1, rows + 1)
    .map(line => line.trim().split(""));

const visited = Array.from(
    { length: rows },
    () => Array(columns).fill(false)
);

const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
];

let colonies = 0;

for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
        if (
            forest[row][column] !== "1" ||
            visited[row][column]
        ) {
            continue;
        }

        colonies++;

        const stack = [[row, column]];
        visited[row][column] = true;

        while (stack.length > 0) {
            const [currentRow, currentColumn] = stack.pop();

            for (const [rowChange, columnChange] of directions) {
                const nextRow = currentRow + rowChange;
                const nextColumn = currentColumn + columnChange;

                if (
                    nextRow >= 0 &&
                    nextRow < rows &&
                    nextColumn >= 0 &&
                    nextColumn < columns &&
                    forest[nextRow][nextColumn] === "1" &&
                    !visited[nextRow][nextColumn]
                ) {
                    visited[nextRow][nextColumn] = true;
                    stack.push([nextRow, nextColumn]);
                }
            }
        }
    }
}

console.log(colonies);