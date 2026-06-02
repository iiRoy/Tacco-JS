const EMPTY_CELL = ".";
const WALL_CELL = "#";
const BRICK_CELL = "*";

const isEmptyCell = cellValue => cellValue === EMPTY_CELL;
const isWallCell = cellValue => cellValue === WALL_CELL;
const isBrickCell = cellValue => cellValue === BRICK_CELL;

function updateTankPosition(deltaY, deltaX, tankChar, gameGrid, tankCoords) {
    const currentY = tankCoords[0];
    const currentX = tankCoords[1];

    const nextY = currentY + deltaY;
    const nextX = currentX + deltaX;

    if (isEmptyCell(gameGrid[nextY][nextX])) {
        gameGrid[nextY][nextX] = tankChar;
        gameGrid[currentY][currentX] = EMPTY_CELL;

        tankCoords[0] += deltaY;
        tankCoords[1] += deltaX;
    } else {
        gameGrid[currentY][currentX] = tankChar;
    }
}

function fireProjectile(deltaY, deltaX, gameGrid, tankCoords) {
    let step = 0;

    while (true) {
        step++;

        const targetY = tankCoords[0] + deltaY * step;
        const targetX = tankCoords[1] + deltaX * step;

        if (isWallCell(gameGrid[targetY][targetX])) {
            break;
        } else if (isBrickCell(gameGrid[targetY][targetX])) {
            gameGrid[targetY][targetX] = EMPTY_CELL;
            break;
        }
    }
}

function normalizeInputDirections(sourceText) {
    return sourceText
        .replace(/\^/g, "U")
        .replace(/v/g, "D")
        .replace(/\</g, "L")
        .replace(/\>/g, "R");
}

function restoreOutputDirections(sourceText) {
    return sourceText
        .replace(/U/g, "^")
        .replace(/D/g, "v")
        .replace(/L/g, "<")
        .replace(/R/g, ">");
}

function createBorderRow() {
    return "####################".split("");
}

function findTankColumn(rowChars) {
    let foundColumn = -1;

    rowChars.forEach(function (cellValue, cellIndex) {
        if (
            cellValue === "U" ||
            cellValue === "D" ||
            cellValue === "L" ||
            cellValue === "R"
        ) {
            foundColumn = cellIndex;
        }
    });

    return foundColumn;
}

const directionDelta = {
    U: [-1, 0],
    D: [1, 0],
    L: [0, -1],
    R: [0, 1]
};

let input = require("fs").readFileSync("/dev/stdin", "utf8");
input = normalizeInputDirections(input);

const lines = input.trim().split("\n");
const testCases = lines.shift() - 0;

for (let caseIndex = 0; caseIndex < testCases; caseIndex++) {
    if (caseIndex !== 0) {
        console.log("");
    }

    const hw = lines.shift().split(" ").map(Number);
    const gridHeight = hw[0];

    const gameGrid = [];
    gameGrid.push(createBorderRow());

    const tankCoords = [0, 0];

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const rowChars = lines.shift().split("");
        const tankColumn = findTankColumn(rowChars);

        if (tankColumn !== -1) {
            tankCoords[0] = rowIndex + 1;
            tankCoords[1] = tankColumn + 1;
        }

        rowChars.unshift(WALL_CELL);
        rowChars.push(WALL_CELL);

        gameGrid.push(rowChars);
    }

    gameGrid.push(createBorderRow());

    lines.shift();

    const commandSequence = lines.shift().split("");

    commandSequence.forEach(function (commandChar) {
        if (
            commandChar === "U" ||
            commandChar === "D" ||
            commandChar === "L" ||
            commandChar === "R"
        ) {
            const moveDelta = directionDelta[commandChar];
            updateTankPosition(
                moveDelta[0],
                moveDelta[1],
                commandChar,
                gameGrid,
                tankCoords
            );
        } else if (commandChar === "S") {
            const currentDirection = gameGrid[tankCoords[0]][tankCoords[1]];

            if (
                currentDirection === "U" ||
                currentDirection === "D" ||
                currentDirection === "L" ||
                currentDirection === "R"
            ) {
                const shotDelta = directionDelta[currentDirection];
                fireProjectile(
                    shotDelta[0],
                    shotDelta[1],
                    gameGrid,
                    tankCoords
                );
            }
        }
    });

    gameGrid.shift();
    gameGrid.pop();

    const answer = gameGrid
        .join("\n")
        .replace(/\,/g, "")
        .replace(/^#|#$/mg, "");

    console.log(restoreOutputDirections(answer));
}