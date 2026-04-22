function launchShell(rowDelta, colDelta, battlefieldGrid, tankPosition) {
    let travelDistance = 0;
    const initialTankRow = tankPosition[0];
    const initialTankCol = tankPosition[1];

    while (true) {
        travelDistance++;
        const targetRow = initialTankRow + (rowDelta * travelDistance);
        const targetCol = initialTankCol + (colDelta * travelDistance);

        const cellContent = battlefieldGrid[targetRow][targetCol];

        if (cellContent === "#") {
            break;
        } else if (cellContent === "*") {
            battlefieldGrid[targetRow][targetCol] = ".";
            break;
        }
    }
}

function standardizeInputChars(rawInputString) {
    return rawInputString
        .replace(/\^/g, "U")
        .replace(/v/g, "D")
        .replace(/\</g, "L")
        .replace(/\>/g, "R");
}

function setupBattlefield(mapLines, mapHeight, mapWidth) {
    const currentBattlefield = [];
    currentBattlefield.push(Array(mapWidth + 2).fill("#"));

    let tankLocation = [-1, -1];

    for (let r = 0; r < mapHeight; r++) {
        const lineData = mapLines[r].split("");
        const processedRow = ["#", ...lineData, "#"];

        let foundTankInRow = false;
        for (let c = 0; c < lineData.length; c++) {
            const char = lineData[c];
            if (char === "U" || char === "D" || char === "L" || char === "R") {
                tankLocation = [r + 1, c + 1];
                foundTankInRow = true;
                break;
            }
        }
        currentBattlefield.push(processedRow);
    }
    currentBattlefield.push(Array(mapWidth + 2).fill("#"));

    if (tankLocation[0] === -1) {
        tankLocation = [1, 1];
    }

    return { grid: currentBattlefield, position: tankLocation };
}

function executeTankAction(actionCode, gridRef, tankPosRef) {
    const currentOrientation = gridRef[tankPosRef[0]][tankPosRef[1]];

    const attemptMove = (deltaR, deltaC, newDirChar) => {
        const nextRow = tankPosRef[0] + deltaR;
        const nextCol = tankPosRef[1] + deltaC;

        gridRef[tankPosRef[0]][tankPosRef[1]] = newDirChar;

        if (gridRef[nextRow][nextCol] === ".") {
            gridRef[nextRow][nextCol] = newDirChar;
            gridRef[tankPosRef[0]][tankPosRef[1]] = ".";
            tankPosRef[0] = nextRow;
            tankPosRef[1] = nextCol;
        }
    };

    switch (actionCode) {
        case "U":
            attemptMove(-1, 0, "U");
            break;
        case "D":
            attemptMove(1, 0, "D");
            break;
        case "L":
            attemptMove(0, -1, "L");
            break;
        case "R":
            attemptMove(0, 1, "R");
            break;
        case "S":
            if (currentOrientation === "U") launchShell(-1, 0, gridRef, tankPosRef);
            else if (currentOrientation === "D") launchShell(1, 0, gridRef, tankPosRef);
            else if (currentOrientation === "L") launchShell(0, -1, gridRef, tankPosRef);
            else if (currentOrientation === "R") launchShell(0, 1, gridRef, tankPosRef);
            break;
    }
}

function prepareOutputGrid(finalGrid) {
    const innerGrid = finalGrid.slice(1, finalGrid.length - 1);

    return innerGrid.map(row => {
        const rowWithoutBorders = row.slice(1, row.length - 1);
        return rowWithoutBorders.join("")
            .replace(/U/g, "^")
            .replace(/D/g, "v")
            .replace(/L/g, "<")
            .replace(/R/g, ">");
    }).join("\n");
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInputContent = standardizeInputChars(fileContent);

let inputLines = processedInputContent.trim().split("\n");

const scenarioCount = +inputLines.shift();

if (isNaN(scenarioCount) || scenarioCount < 0) {
    console.error("Invalid number of test scenarios provided.");
    process.exit(1);
}

for (let testCaseIdx = 0; testCaseIdx < scenarioCount; testCaseIdx++) {
    if (testCaseIdx !== 0) {
        console.log("\n");
    }

    const mapDimensions = inputLines.shift().split(" ").map(Number);
    const mapHeight = mapDimensions[0];
    const mapWidth = mapDimensions[1];

    if (isNaN(mapHeight) || isNaN(mapWidth) || mapHeight <= 0 || mapWidth <= 0) {
        for (let i = 0; i < mapHeight; i++) inputLines.shift();
        inputLines.shift();
        inputLines.shift();
        continue;
    }

    const { grid: battlefieldGrid, position: tankCoordinates } = setupBattlefield(
        inputLines.splice(0, mapHeight),
        mapHeight,
        mapWidth
    );

    inputLines.shift();

    const commandSequence = inputLines.shift().split("");

    for (const actionChar of commandSequence) {
        executeTankAction(actionChar, battlefieldGrid, tankCoordinates);
    }

    const finalOutput = prepareOutputGrid(battlefieldGrid);
    console.log(finalOutput);
}