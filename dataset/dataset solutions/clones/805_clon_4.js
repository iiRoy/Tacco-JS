function projectileStrike(currentGrid, currentTankPos, deltaRow, deltaCol) {
    const impactGrid = currentGrid.map(row => [...row]);
    const { r: startR, c: startC } = currentTankPos;

    const maxDistance = Math.max(currentGrid.length, currentGrid[0].length);
    const trajectoryPoints = Array.from({ length: maxDistance }, (_, idx) => ({
        r: startR + deltaRow * (idx + 1),
        c: startC + deltaCol * (idx + 1)
    }));

    for (const point of trajectoryPoints) {
        const { r, c } = point;
        if (r < 0 || r >= impactGrid.length || c < 0 || c >= impactGrid[0].length) {
            break;
        }

        const targetCell = impactGrid[r][c];
        if (targetCell === "#") {
            break;
        } else if (targetCell === "*") {
            impactGrid[r][c] = ".";
            break;
        }
    }
    return impactGrid;
}

const commandExecutors = {
    "U": (currentGrid, tankState) => {
        const { r, c } = tankState;
        const nextR = r - 1;
        const targetCell = currentGrid[nextR][c];
        let nextGrid = currentGrid.map(row => [...row]);
        let nextTankState = { ...tankState, dir: "U" };

        if (targetCell === ".") {
            nextGrid[nextR][c] = "U";
            nextGrid[r][c] = ".";
            nextTankState.r = nextR;
        } else {
            nextGrid[r][c] = "U";
        }
        return { grid: nextGrid, tank: nextTankState };
    },
    "D": (currentGrid, tankState) => {
        const { r, c } = tankState;
        const nextR = r + 1;
        const targetCell = currentGrid[nextR][c];
        let nextGrid = currentGrid.map(row => [...row]);
        let nextTankState = { ...tankState, dir: "D" };

        if (targetCell === ".") {
            nextGrid[nextR][c] = "D";
            nextGrid[r][c] = ".";
            nextTankState.r = nextR;
        } else {
            nextGrid[r][c] = "D";
        }
        return { grid: nextGrid, tank: nextTankState };
    },
    "L": (currentGrid, tankState) => {
        const { r, c } = tankState;
        const nextC = c - 1;
        const targetCell = currentGrid[r][nextC];
        let nextGrid = currentGrid.map(row => [...row]);
        let nextTankState = { ...tankState, dir: "L" };

        if (targetCell === ".") {
            nextGrid[r][nextC] = "L";
            nextGrid[r][c] = ".";
            nextTankState.c = nextC;
        } else {
            nextGrid[r][c] = "L";
        }
        return { grid: nextGrid, tank: nextTankState };
    },
    "R": (currentGrid, tankState) => {
        const { r, c } = tankState;
        const nextC = c + 1;
        const targetCell = currentGrid[r][nextC];
        let nextGrid = currentGrid.map(row => [...row]);
        let nextTankState = { ...tankState, dir: "R" };

        if (targetCell === ".") {
            nextGrid[r][nextC] = "R";
            nextGrid[r][c] = ".";
            nextTankState.c = nextC;
        } else {
            nextGrid[r][c] = "R";
        }
        return { grid: nextGrid, tank: nextTankState };
    },
    "S": (currentGrid, tankState) => {
        const { dir } = tankState;
        let deltaR = 0, deltaC = 0;
        switch (dir) {
            case "U": deltaR = -1; break;
            case "D": deltaR = 1; break;
            case "L": deltaC = -1; break;
            case "R": deltaC = 1; break;
        }
        const updatedGrid = projectileStrike(currentGrid, tankState, deltaR, deltaC);
        return { grid: updatedGrid, tank: tankState };
    }
};

function simulateTankBattle(height, width, mapRows, commands) {
    const fullWidth = width + 2;

    let initialTankState = { r: 0, c: 0, dir: '' };

    const initialBattlefield = Array.from({ length: height + 2 }, (_, rowIndex) => {
        if (rowIndex === 0 || rowIndex === height + 1) {
            return Array.from({ length: fullWidth }, () => "#");
        } else {
            const rowContent = mapRows[rowIndex - 1].split("");
            const rowWithBorders = ["#", ...rowContent, "#"];

            const tankIndex = rowContent.findIndex(char => ["U", "D", "L", "R"].includes(char));
            if (tankIndex !== -1) {
                initialTankState = {
                    r: rowIndex,
                    c: tankIndex + 1,
                    dir: rowContent[tankIndex]
                };
            }
            return rowWithBorders;
        }
    });

    const finalState = commands.reduce((acc, cmd) => {
        const executor = commandExecutors[cmd];
        return executor ? executor(acc.grid, acc.tank) : acc;
    }, { grid: initialBattlefield, tank: initialTankState });

    const outputGrid = finalState.grid.slice(1, -1);

    const outputString = outputGrid.map(row => {
        const innerRow = row.slice(1, -1);
        return innerRow.map(char => {
            switch (char) {
                case "U": return "^";
                case "D": return "v";
                case "L": return "<";
                case "R": return ">";
                default: return char;
            }
        }).join("");
    }).join("\n");

    return outputString;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const charTranslation = { "^": "U", "v": "D", "<": "L", ">": "R" };
const processedInputData = rawInputData.replace(/[\^v<>]/g, (match) => charTranslation[match]);
let allInputLines = processedInputData.trim().split("\n");

const numberOfTestCases = parseInt(allInputLines.shift(), 10);

for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    if (caseIndex > 0) {
        console.log("");
    }
    const [mapHeight, mapWidth] = allInputLines.shift().split(" ").map(Number);
    const mapContentLines = allInputLines.splice(0, mapHeight);
    allInputLines.shift();
    const commandSequence = allInputLines.shift().split("");

    const battleResult = simulateTankBattle(mapHeight, mapWidth, mapContentLines, commandSequence);
    console.log(battleResult);
}
