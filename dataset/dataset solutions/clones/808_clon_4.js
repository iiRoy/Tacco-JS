const fileSystem = require('fs');

const inputCharMapping = new Map([
    ['^', 'U'],
    ['v', 'D'],
    ['<', 'L'],
    ['>', 'R']
]);

const outputCharMapping = new Map([
    ['U', '^'],
    ['D', 'v'],
    ['L', '<'],
    ['R', '>']
]);

const maneuverVehicle = (stateObject, yDelta, xDelta, newOrientation) => {
    const { vehicleCoordinates: [currentY, currentX], terrainGrid } = stateObject;
    const targetY = currentY + yDelta;
    const targetX = currentX + xDelta;

    const targetCellContent = terrainGrid[targetY][targetX];

    if (targetCellContent === ".") {
        terrainGrid[targetY][targetX] = newOrientation;
        terrainGrid[currentY][currentX] = ".";
        stateObject.vehicleCoordinates = [targetY, targetX];
    } else {
        terrainGrid[currentY][currentX] = newOrientation;
    }
};

const launchProjectile = (stateObject, yDirection, xDirection) => {
    const { vehicleCoordinates: [originY, originX], terrainGrid } = stateObject;

    for (let propagationStep = 1; ; propagationStep++) {
        const impactY = originY + (yDirection * propagationStep);
        const impactX = originX + (xDirection * propagationStep);

        const cellAtImpact = terrainGrid[impactY][impactX];

        switch (cellAtImpact) {
            case "#":
                return;
            case "*":
                terrainGrid[impactY][impactX] = ".";
                return;
        }
    }
};

const commandProcessors = {
    'U': (state) => maneuverVehicle(state, -1, 0, 'U'),
    'D': (state) => maneuverVehicle(state, 1, 0, 'D'),
    'L': (state) => maneuverVehicle(state, 0, -1, 'L'),
    'R': (state) => maneuverVehicle(state, 0, 1, 'R'),
    'S': (state) => {
        const currentVehicleOrientation = state.terrainGrid[state.vehicleCoordinates[0]][state.vehicleCoordinates[1]];
        const shotDirectionDispatch = {
            'U': () => launchProjectile(state, -1, 0),
            'D': () => launchProjectile(state, 1, 0),
            'L': () => launchProjectile(state, 0, -1),
            'R': () => launchProjectile(state, 0, 1),
        };
        shotDirectionDispatch[currentVehicleOrientation]();
    }
};

let rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputData.trim().split("\n");

const totalTestCases = parseInt(processedInputLines.shift(), 10);

for (let caseIndex = 0; caseIndex < totalTestCases; caseIndex++) {
    if (caseIndex !== 0) {
        console.log("");
    }

    const [mapHeight, mapWidth] = processedInputLines.shift().split(" ").map(Number);
    const internalMapContent = [];
    let initialVehiclePosition = [0, 0];

    for (let rowIdx = 0; rowIdx < mapHeight; rowIdx++) {
        const rowChars = processedInputLines.shift().split('');
        const vehicleColIdx = rowChars.findIndex(cellChar => ['U', 'D', 'L', 'R'].includes(cellChar));
        if (vehicleColIdx !== -1) {
            initialVehiclePosition = [rowIdx + 1, vehicleColIdx + 1];
        }
        internalMapContent.push(rowChars);
    }

    const battleGrid = Array(mapHeight + 2).fill(null).map((_, gridRowIdx) => {
        if (gridRowIdx === 0 || gridRowIdx === mapHeight + 1) {
            return Array(mapWidth + 2).fill('#');
        } else {
            return ['#', ...internalMapContent[gridRowIdx - 1], '#'];
        }
    });

    processedInputLines.shift(); // Consume the empty line
    const actionSequence = processedInputLines.shift().split('').map(char => inputCharMapping.get(char) || char);

    const currentGameState = {
        vehicleCoordinates: initialVehiclePosition,
        terrainGrid: battleGrid
    };

    for (const actionCommand of actionSequence) {
        commandProcessors[actionCommand](currentGameState);
    }

    const finalMapRows = currentGameState.terrainGrid.slice(1, -1).map(row =>
        row.slice(1, -1).map(cell => outputCharMapping.get(cell) || cell).join('')
    );

    console.log(finalMapRows.join("\n"));
}
