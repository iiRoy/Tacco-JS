const dataAcquirer = require('fs');

const extractGridData = () => {
    const gridRawLines = dataAcquirer.readFileSync('/dev/stdin', 'utf8').trim().split('\n');
    return gridRawLines.map(line => line.split('').map(Number));
};

const passageMatrix = extractGridData();

const pathwayValidator = (horizontalAxis, verticalAxis, targetH, targetV, matrixData) => {
    if (targetH < 0 || targetV < 0) return false;

    const maxHIndex = matrixData[0].length - 1;
    const maxVIndex = (matrixData.length - 1) / 2;

    if (targetH > maxHIndex || targetV > maxVIndex) return false;

    let segmentValue;

    if (targetH === horizontalAxis + 1 && targetV === verticalAxis) { // Movement to the right
        const rowInMatrix = 2 * verticalAxis;
        if (rowInMatrix >= matrixData.length) return false;
        segmentValue = matrixData[rowInMatrix][horizontalAxis];
    } else if (targetH === horizontalAxis - 1 && targetV === verticalAxis) { // Movement to the left
        const rowInMatrix = 2 * verticalAxis;
        if (rowInMatrix >= matrixData.length) return false;
        segmentValue = matrixData[rowInMatrix][horizontalAxis - 1];
    } else if (targetV === verticalAxis + 1 && targetH === horizontalAxis) { // Movement downwards
        const rowInMatrix = 2 * verticalAxis + 1;
        if (rowInMatrix >= matrixData.length) return false;
        segmentValue = matrixData[rowInMatrix][horizontalAxis];
    } else if (targetV === verticalAxis - 1 && targetH === horizontalAxis) { // Movement upwards
        const rowInMatrix = 2 * verticalAxis - 1;
        if (rowInMatrix < 0) return false;
        segmentValue = matrixData[rowInMatrix][horizontalAxis];
    } else {
        return false;
    }

    return segmentValue === 1;
};

const navigationDirectiveSets = new Map([
    ['WEST', [
        { dH: -1, dV: 0, newDirection: 'WEST', pathSymbol: 'L' },
        { dH: 0, dV: -1, newDirection: 'NORTH', pathSymbol: 'U' },
        { dH: 0, dV: 1, newDirection: 'SOUTH', pathSymbol: 'D' }
    ]],
    ['EAST', [
        { dH: 1, dV: 0, newDirection: 'EAST', pathSymbol: 'R' },
        { dH: 0, dV: 1, newDirection: 'SOUTH', pathSymbol: 'D' },
        { dH: 0, dV: -1, newDirection: 'NORTH', pathSymbol: 'U' }
    ]],
    ['SOUTH', [
        { dH: 0, dV: 1, newDirection: 'SOUTH', pathSymbol: 'D' },
        { dH: 1, dV: 0, newDirection: 'EAST', pathSymbol: 'R' },
        { dH: -1, dV: 0, newDirection: 'WEST', pathSymbol: 'L' }
    ]],
    ['NORTH', [
        { dH: 0, dV: -1, newDirection: 'NORTH', pathSymbol: 'U' },
        { dH: -1, dV: 0, newDirection: 'WEST', pathSymbol: 'L' },
        { dH: 1, dV: 0, newDirection: 'EAST', pathSymbol: 'R' }
    ]]
]);

const navigateMaze = (initialH, initialV, initialDirection, gridData) => {
    let currentHCoord = initialH;
    let currentVCoord = initialV;
    let currentHeading = initialDirection;
    let journeyLog = '';

    while (true) {
        const potentialMoveOptions = navigationDirectiveSets.get(currentHeading);
        let movementOccurred = false;

        for (const option of potentialMoveOptions) {
            const nextHCoord = currentHCoord + option.dH;
            const nextVCoord = currentVCoord + option.dV;

            if (pathwayValidator(currentHCoord, currentVCoord, nextHCoord, nextVCoord, gridData)) {
                currentHCoord = nextHCoord;
                currentVCoord = nextVCoord;
                currentHeading = option.newDirection;
                journeyLog += option.pathSymbol;
                movementOccurred = true;
                break;
            }
        }

        if (!movementOccurred) {
            break; // Should not happen in a solvable maze, implies getting stuck
        }

        if (currentHCoord === 0 && currentVCoord === 0 && journeyLog.length > 0) {
            break; // Returned to the origin after at least one step
        }
    }
    return journeyLog;
};

const finalJourneyOutput = navigateMaze(0, 0, 'EAST', passageMatrix);
console.log(finalJourneyOutput);