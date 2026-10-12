class InputSource {
    #lines;
    #currentIdx;
    #maxLines;

    constructor(rawData) {
        this.#lines = rawData.trim().split("\n");
        this.#currentIdx = 0;
        this.#maxLines = this.#lines.length;
    }

    next() {
        if (!this.hasNext()) {
            throw new Error("NoSuchElementException:次に要素は無いよ");
        }
        const value = this.#lines[this.#currentIdx];
        this.#currentIdx++;
        return value;
    }

    hasNext() {
        return this.#currentIdx < this.#maxLines;
    }
}

const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputReader = new InputSource(rawInputData);

function next() { return inputReader.next(); }
function hasNext() { return inputReader.hasNext(); }

function myout(t) { console.log(t); }
function myerr(t) { console.error(t); }

const conversionHandlers = new Map([
    [1, (val) => parseInt(val)],
    [2, (val) => val.split(" ")],
    [4, (val) => val.split(" ").map(Number)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map(Number)],
    [8, (arr) => arr.join(" ")],
    [9, (arr) => arr.join("\n")],
    [0, (arr) => arr.join("")]
]);

function myconv(item, transformCode) {
    try {
        const handler = conversionHandlers.get(transformCode);
        return handler ? handler(item) : item;
    } catch (e) {
        return item;
    }
}

const PathDirection = {
    FROM_BELOW: 'from_below',
    FROM_RIGHT: 'from_right'
};

function Main() {
    const dimensions = myconv(next(), 4);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const mazeGrid = Array.from({ length: gridHeight }, () => myconv(next(), 6));

    const isValidCoord = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
    const isWall = (r, c) => isValidCoord(r, c) && mazeGrid[r][c] === '#';
    const isPath = (r, c) => isValidCoord(r, c) && mazeGrid[r][c] === '.';
    const isNotWall = (r, c) => !isValidCoord(r, c) || !isWall(r, c);

    function findReversePath(currY, currX, arrivalDir) {
        myerr(`${currX} ${currY}`);

        mazeGrid[currY][currX] = 'k';

        if (currY === 0 && currX === 0) {
            return isNotWall(0, 1) && isNotWall(1, 0);
        }

        const cellAbove = { y: currY - 1, x: currX };
        const cellLeft = { y: currY, x: currX - 1 };
        const cellRight = { y: currY, x: currX + 1 };
        const cellBelow = { y: currY + 1, x: currX };

        let nextY, nextX, nextArrivalDir;
        let moveDetermined = false;

        if (currX === 0) {
            if (isWall(cellAbove.y, cellAbove.x) && isNotWall(cellRight.y, cellRight.x) && isNotWall(cellBelow.y, cellBelow.x)) {
                nextY = cellAbove.y;
                nextX = cellAbove.x;
                nextArrivalDir = PathDirection.FROM_BELOW;
                moveDetermined = true;
            }
        } else if (currY === 0) {
            if (isWall(cellLeft.y, cellLeft.x) && isNotWall(cellBelow.y, cellBelow.x) && isNotWall(cellRight.y, cellRight.x)) {
                nextY = cellLeft.y;
                nextX = cellLeft.x;
                nextArrivalDir = PathDirection.FROM_RIGHT;
                moveDetermined = true;
            }
        } else if (currY === gridHeight - 1 || currX === gridWidth - 1) {
            const boundaryCondition = (isWall(cellAbove.y, cellAbove.x) && isPath(cellLeft.y, cellLeft.x)) ||
                                      (isWall(cellLeft.y, cellLeft.x) && isPath(cellAbove.y, cellAbove.x));
            if (boundaryCondition) {
                if (isWall(cellAbove.y, cellAbove.x)) {
                    nextY = cellAbove.y;
                    nextX = cellAbove.x;
                    nextArrivalDir = PathDirection.FROM_BELOW;
                } else {
                    nextY = cellLeft.y;
                    nextX = cellLeft.x;
                    nextArrivalDir = PathDirection.FROM_RIGHT;
                }
                moveDetermined = true;
            }
        } else {
            const generalMoveCondition = (isWall(cellAbove.y, cellAbove.x) && isPath(cellLeft.y, cellLeft.x)) ||
                                         (isWall(cellLeft.y, cellLeft.x) && isPath(cellAbove.y, cellAbove.x));

            if (arrivalDir === PathDirection.FROM_BELOW) {
                if (generalMoveCondition && isNotWall(cellRight.y, cellRight.x)) {
                    if (isWall(cellAbove.y, cellAbove.x)) {
                        nextY = cellAbove.y;
                        nextX = cellAbove.x;
                        nextArrivalDir = PathDirection.FROM_BELOW;
                    } else {
                        nextY = cellLeft.y;
                        nextX = cellLeft.x;
                        nextArrivalDir = PathDirection.FROM_RIGHT;
                    }
                    moveDetermined = true;
                }
            } else {
                if (generalMoveCondition && isNotWall(cellBelow.y, cellBelow.x)) {
                    if (isWall(cellAbove.y, cellAbove.x)) {
                        nextY = cellAbove.y;
                        nextX = cellAbove.x;
                        nextArrivalDir = PathDirection.FROM_BELOW;
                    } else {
                        nextY = cellLeft.y;
                        nextX = cellLeft.x;
                        nextArrivalDir = PathDirection.FROM_RIGHT;
                    }
                    moveDetermined = true;
                }
            }
        }

        if (!moveDetermined) {
            return false;
        }

        return findReversePath(nextY, nextX, nextArrivalDir);
    }

    let initialY = gridHeight - 1;
    let initialX = gridWidth - 1;
    let firstArrivalDirection;

    if (isWall(initialY - 1, initialX)) {
        initialY--;
        firstArrivalDirection = PathDirection.FROM_BELOW;
    } else {
        initialX--;
        firstArrivalDirection = PathDirection.FROM_RIGHT;
    }

    mazeGrid[gridHeight - 1][gridWidth - 1] = 'k';

    if (findReversePath(initialY, initialX, firstArrivalDirection)) {
        myout("Possible");
    } else {
        myout("Impossible");
    }
}

Main();
