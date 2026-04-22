const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const directionVectors = {
    'UP': { rDelta: -1, cDelta: 0 },
    'DOWN': { rDelta: 1, cDelta: 0 },
    'LEFT': { rDelta: 0, cDelta: -1 },
    'RIGHT': { rDelta: 0, cDelta: 1 }
};

const executeProjectile = (initialPanel, startRow, startCol, rowInc, colInc) => {
    let activePanel = initialPanel.map(row => [...row]);

    const tracePath = (stepCount) => {
        const nextRow = startRow + (rowInc * stepCount);
        const nextCol = startCol + (colInc * stepCount);

        const currentTarget = activePanel[nextRow][nextCol];

        if (currentTarget === '#') {
            return;
        } else if (currentTarget === '*') {
            activePanel[nextRow][nextCol] = '.';
            return;
        } else {
            tracePath(stepCount + 1);
        }
    };

    tracePath(1);

    return activePanel;
};

const processInstruction = (currentScenarioState, instructionSymbol) => {
    let { layout: currentLayout, vehicleStatus: currentVehicle } = currentScenarioState;
    let nextLayout = currentLayout.map(row => [...row]);
    let nextVehicleStatus = { ...currentVehicle };

    if (instructionSymbol === 'S') {
        const { rDelta, cDelta } = directionVectors[currentVehicle.orientation];
        nextLayout = executeProjectile(currentLayout, currentVehicle.rowCoord, currentVehicle.colCoord, rDelta, cDelta);
    } else {
        const { rDelta, cDelta } = directionVectors[instructionSymbol];
        const nextVehicleRow = currentVehicle.rowCoord + rDelta;
        const nextVehicleCol = currentVehicle.colCoord + cDelta;

        if (nextLayout[nextVehicleRow][nextVehicleCol] === '.') {
            nextLayout[nextVehicleRow][nextVehicleCol] = instructionSymbol;
            nextLayout[currentVehicle.rowCoord][currentVehicle.colCoord] = '.';
            nextVehicleStatus.rowCoord = nextVehicleRow;
            nextVehicleStatus.colCoord = nextVehicleCol;
            nextVehicleStatus.orientation = instructionSymbol;
        } else {
            nextLayout[currentVehicle.rowCoord][currentVehicle.colCoord] = instructionSymbol;
            nextVehicleStatus.orientation = instructionSymbol;
        }
    }
    return { layout: nextLayout, vehicleStatus: nextVehicleStatus };
};

const handleChallenges = (remainingInputLines, totalChallenges, currentChallengeIndex = 0) => {
    if (currentChallengeIndex >= totalChallenges) {
        return;
    }

    if (currentChallengeIndex > 0) {
        console.log('');
    }

    const [boardRows, boardCols] = remainingInputLines.shift().split(' ').map(Number);
    let initialPanel = [];
    let initialVehicle = { rowCoord: -1, colCoord: -1, orientation: '' };

    const fullPanelWidth = boardCols + 2;
    const boundaryRow = Array(fullPanelWidth).fill('#');
    initialPanel.push(boundaryRow);

    for (let r = 0; r < boardRows; ++r) {
        const rowContent = remainingInputLines.shift().split('');
        const paddedRow = ['#', ...rowContent, '#'];
        initialPanel.push(paddedRow);

        const vehicleIndicator = rowContent.find(char => ['UP', 'DOWN', 'LEFT', 'RIGHT'].includes(char));
        if (vehicleIndicator) {
            initialVehicle = {
                rowCoord: r + 1,
                colCoord: rowContent.indexOf(vehicleIndicator) + 1,
                orientation: vehicleIndicator
            };
        }
    }
    initialPanel.push(boundaryRow);

    remainingInputLines.shift();
    const instructionSequence = remainingInputLines.shift().split('');

    const finalScenarioState = instructionSequence.reduce(processInstruction, {
        layout: initialPanel,
        vehicleStatus: initialVehicle
    });

    const finalLayout = finalScenarioState.layout;

    const innerLayout = finalLayout.slice(1, finalLayout.length - 1);
    const displayRows = innerLayout.map(row =>
        row.slice(1, row.length - 1)
           .join('')
           .replace(/UP/g, '^')
           .replace(/DOWN/g, 'v')
           .replace(/LEFT/g, '<')
           .replace(/RIGHT/g, '>')
    );
    console.log(displayRows.join('\n'));

    handleChallenges(remainingInputLines, totalChallenges, currentChallengeIndex + 1);
};

const transformedInput = sourceData
    .split('')
    .map(symbol => {
        switch (symbol) {
            case '^': return 'UP';
            case 'v': return 'DOWN';
            case '<': return 'LEFT';
            case '>': return 'RIGHT';
            default: return symbol;
        }
    })
    .join('');

let inputLines = transformedInput.trim().split('\n');
const totalChallengesToProcess = parseInt(inputLines.shift(), 10);

handleChallenges(inputLines, totalChallengesToProcess);