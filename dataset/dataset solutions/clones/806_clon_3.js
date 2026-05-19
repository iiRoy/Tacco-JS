const readGameInput = () => {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawData.trim().split("\n");
};

let gameGrid;
let tankCoords;

const isCellEmpty = (r, c) => gameGrid[r][c] === ".";

const getTankDirectionChar = (r, c) => gameGrid[r][c];

function updateTankPosition(deltaY, deltaX, newDirectionChar) {
    const currentTankY = tankCoords[0];
    const currentTankX = tankCoords[1];
    const nextTankY = currentTankY + deltaY;
    const nextTankX = currentTankX + deltaX;

    if (isCellEmpty(nextTankY, nextTankX)) {
        gameGrid[nextTankY][nextTankX] = newDirectionChar;
        gameGrid[currentTankY][currentTankX] = ".";
        tankCoords[0] = nextTankY;
        tankCoords[1] = nextTankX;
    } else {
        gameGrid[currentTankY][currentTankX] = newDirectionChar;
    }
}

const getProjectileVector = (tankChar) => {
    switch (tankChar) {
        case "^": return [-1, 0];
        case "v": return [1, 0];
        case "<": return [0, -1];
        case ">": return [0, 1];
        default: return [0, 0];
    }
};

function fireProjectile() {
    const currentTankDirection = getTankDirectionChar(tankCoords[0], tankCoords[1]);
    const [projDeltaY, projDeltaX] = getProjectileVector(currentTankDirection);

    let stepCount = 0;
    while (true) {
        stepCount++;
        const projectileTargetY = tankCoords[0] + (projDeltaY * stepCount);
        const projectileTargetX = tankCoords[1] + (projDeltaX * stepCount);

        const targetCellContent = gameGrid[projectileTargetY][projectileTargetX];

        if (targetCellContent === "#") {
            break;
        } else if (targetCellContent === "*") {
            gameGrid[projectileTargetY][projectileTargetX] = ".";
            break;
        }
    }
}

let inputLines = readGameInput();
let testCaseCount = Number(inputLines.shift());

for (let caseIndex = 0; caseIndex < testCaseCount; caseIndex++) {
    if (caseIndex > 0) {
        console.log("");
    }

    const mapDimensionsStr = inputLines.shift().split(" ");
    const mapHeight = Number(mapDimensionsStr[0]);
    const mapWidth = Number(mapDimensionsStr[1]);

    gameGrid = [];
    
    const boundaryRow = Array(mapWidth + 2).fill("#");
    gameGrid.push(boundaryRow);

    let foundTank = false;
    for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
        const rawRowChars = inputLines.shift().split("");
        const paddedRow = ["#", ...rawRowChars, "#"];

        if (!foundTank) {
            for (let colIndex = 0; colIndex < rawRowChars.length; colIndex++) {
                const char = rawRowChars[colIndex];
                if (["^", "v", "<", ">"].includes(char)) {
                    tankCoords = [rowIndex + 1, colIndex + 1];
                    foundTank = true;
                    break;
                }
            }
        }
        gameGrid.push(paddedRow);
    }
    
    gameGrid.push(boundaryRow);

    inputLines.shift();
    const commandSequence = inputLines.shift().split("");

    for (const commandChar of commandSequence) {
        switch (commandChar) {
            case "U": updateTankPosition(-1, 0, "^"); break;
            case "D": updateTankPosition(1, 0, "v"); break;
            case "L": updateTankPosition(0, -1, "<"); break;
            case "R": updateTankPosition(0, 1, ">"); break;
            case "S": fireProjectile(); break;
        }
    }

    const innerGrid = gameGrid.slice(1, -1);
    const formattedRows = innerGrid.map(row => row.slice(1, -1).join(""));
    const finalMapOutput = formattedRows.join("\n");
    
    console.log(finalMapOutput);
}
