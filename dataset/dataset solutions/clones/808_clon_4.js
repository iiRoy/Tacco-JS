const DIRECTION_VECTORS = new Map([
    ['U', { deltaRow: -1, deltaCol: 0 }],
    ['D', { deltaRow: 1, deltaCol: 0 }],
    ['L', { deltaRow: 0, deltaCol: -1 }],
    ['R', { deltaRow: 0, deltaCol: 1 }],
]);

const getCoordKey = (row, col) => `${row},${col}`;

function updateVehiclePosition(currentVehicle, currentMap, directionSymbol) {
    const { row: initialRow, col: initialCol } = currentVehicle;
    const { deltaRow, deltaCol } = DIRECTION_VECTORS.get(directionSymbol);

    const targetRow = initialRow + deltaRow;
    const targetCol = initialCol + deltaCol;

    const modifiedMap = new Map(currentMap); // Immutable update pattern

    let nextVehicleState = { ...currentVehicle, orientation: directionSymbol }; // Vehicle always updates its orientation

    const targetCellContent = modifiedMap.get(getCoordKey(targetRow, targetCol));

    if (targetCellContent === '.') {
        // Movement is permissible
        modifiedMap.set(getCoordKey(initialRow, initialCol), '.'); // Clear previous location
        modifiedMap.set(getCoordKey(targetRow, targetCol), directionSymbol); // Set new location with orientation
        nextVehicleState.row = targetRow;
        nextVehicleState.col = targetCol;
    } else {
        // Movement is obstructed, only update orientation at current location
        modifiedMap.set(getCoordKey(initialRow, initialCol), directionSymbol);
    }
    
    return { vehicleState: nextVehicleState, terrainMap: modifiedMap };
}

function fireOrdnance(currentVehicle, currentMap) {
    const { row: launchRow, col: launchCol, orientation } = currentVehicle;
    const { deltaRow, deltaCol } = DIRECTION_VECTORS.get(orientation);

    const updatedMap = new Map(currentMap); // Immutable update pattern

    // Recursive trajectory tracing
    const traceImpact = (currentRayRow, currentRayCol) => {
        const nextRayRow = currentRayRow + deltaRow;
        const nextRayCol = currentRayCol + deltaCol;
        const nextRayKey = getCoordKey(nextRayRow, nextRayCol);
        const cellData = updatedMap.get(nextRayKey);

        if (cellData === undefined || cellData === '#') { // Wall or beyond boundaries
            return; // Projectile halts
        } else if (cellData === '*') {
            updatedMap.set(nextRayKey, '.'); // Target neutralized
            return; // Projectile halts
        } else {
            // Continue projectile path
            traceImpact(nextRayRow, nextRayCol);
        }
    };

    traceImpact(launchRow, launchCol); // Initiate trace from vehicle's position
    return updatedMap;
}

function executeSingleScenario(scenarioInputLines) {
    let remainingLines = [...scenarioInputLines];

    const [gridHeightStr, gridWidthStr] = remainingLines.shift().split(' ');
    const gridHeight = parseInt(gridHeightStr, 10);
    const gridWidth = parseInt(gridWidthStr, 10);

    const baseMap = new Map();
    let initialVehicle = { row: -1, col: -1, orientation: '' };

    // Establish top boundary
    for (let currentColumn = 0; currentColumn <= gridWidth + 1; currentColumn++) {
        baseMap.set(getCoordKey(0, currentColumn), '#');
    }

    // Populate core grid rows and locate initial vehicle placement
    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        const lineContent = remainingLines.shift();
        baseMap.set(getCoordKey(currentRow + 1, 0), '#'); // Left boundary
        for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {
            const character = lineContent[currentColumn];
            baseMap.set(getCoordKey(currentRow + 1, currentColumn + 1), character);
            if (DIRECTION_VECTORS.has(character)) {
                initialVehicle.row = currentRow + 1;
                initialVehicle.col = currentColumn + 1;
                initialVehicle.orientation = character;
            }
        }
        baseMap.set(getCoordKey(currentRow + 1, gridWidth + 1), '#'); // Right boundary
    }

    // Establish bottom boundary
    for (let currentColumn = 0; currentColumn <= gridWidth + 1; currentColumn++) {
        baseMap.set(getCoordKey(gridHeight + 1, currentColumn), '#');
    }
    
    remainingLines.shift(); // Consume the blank line after grid data
    const instructionSequence = remainingLines.shift().split('');

    let currentVehicleState = initialVehicle;
    let currentTerrainMap = baseMap;

    // Process each instruction
    instructionSequence.forEach(instruction => {
        if (instruction === 'S') {
            currentTerrainMap = fireOrdnance(currentVehicleState, currentTerrainMap);
        } else {
            const { vehicleState: nextVehicle, terrainMap: nextMap } = updateVehiclePosition(currentVehicleState, currentTerrainMap, instruction);
            currentVehicleState = nextVehicle;
            currentTerrainMap = nextMap;
        }
    });

    // Generate final grid representation, omitting external boundaries
    let resultingLayout = [];
    for (let r = 1; r <= gridHeight; r++) {
        let rowCharacters = [];
        for (let c = 1; c <= gridWidth; c++) {
            rowCharacters.push(currentTerrainMap.get(getCoordKey(r, c)));
        }
        resultingLayout.push(rowCharacters.join(''));
    }

    return resultingLayout;
}

// Input acquisition and initial transformation
const inputSourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const normalizedInput = inputSourceData
    .trim()
    .replace(/\^/g, 'U')
    .replace(/v/g, 'D')
    .replace(/\</g, 'L')
    .replace(/\>/g, 'R');

const allScenarioLines = normalizedInput.split('\n');
const totalTestCases = parseInt(allScenarioLines.shift(), 10);

let accumulatedOutputs = [];

for (let caseIndex = 0; caseIndex < totalTestCases; caseIndex++) {
    // Determine the number of lines consumed by the current scenario
    // (H W line) + (H grid lines) + (empty line) + (command line)
    const [hVal, wVal] = allScenarioLines[0].split(' ').map(Number);
    const linesForThisCase = 1 + hVal + 1 + 1; 
    
    const currentCaseData = allScenarioLines.splice(0, linesForThisCase);
    
    const finalGridResult = executeSingleScenario(currentCaseData);
    
    accumulatedOutputs.push(finalGridResult);
}

// Final display rendering
accumulatedOutputs.forEach((gridOutputLines, idx) => {
    if (idx > 0) {
        console.log(''); // Insert blank line between outputs
    }
    const formattedDisplay = gridOutputLines.map(line => 
        line.replace(/U/g, '^')
            .replace(/D/g, 'v')
            .replace(/L/g, '<')
            .replace(/R/g, '>')
    ).join('\n');
    console.log(formattedDisplay);
});