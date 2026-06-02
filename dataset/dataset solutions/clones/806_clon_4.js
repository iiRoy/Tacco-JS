const createInputReader = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    let currentLineIndex = 0;
    return {
        fetchNextLine: () => {
            if (currentLineIndex >= lines.length) {
                return null;
            }
            return lines[currentLineIndex++];
        }
    };
};

const movementVectors = {
    'U': { deltaY: -1, deltaX: 0, newChar: '^' },
    'D': { deltaY: 1, deltaX: 0, newChar: 'v' },
    'L': { deltaY: 0, deltaX: -1, newChar: '<' },
    'R': { deltaY: 0, deltaX: 1, newChar: '>' }
};

const projectileDirections = {
    '^': { deltaY: -1, deltaX: 0 },
    'v': { deltaY: 1, deltaX: 0 },
    '<': { deltaY: 0, deltaX: -1 },
    '>': { deltaY: 0, deltaX: 1 }
};

const updateBattlefieldForMovement = (currentMapState, currentTankCoordinates, movementInstruction) => {
    const [tankY, tankX] = currentTankCoordinates;
    const { deltaY, deltaX, newChar } = movementInstruction;

    const targetY = tankY + deltaY;
    const targetX = tankX + deltaX;

    const nextMapState = new Map(currentMapState);
    let nextTankCoordinates = [...currentTankCoordinates];

    const targetCellContent = nextMapState.get(`${targetY},${targetX}`);

    if (targetCellContent === '.') {
        nextMapState.set(`${tankY},${tankX}`, '.');
        nextMapState.set(`${targetY},${targetX}`, newChar);
        nextTankCoordinates = [targetY, targetX];
    } else {
        nextMapState.set(`${tankY},${tankX}`, newChar);
    }

    return { field: nextMapState, craftPosition: nextTankCoordinates };
};

const updateBattlefieldForShot = (currentMapState, currentTankCoordinates, tankOrientation) => {
    const [originY, originX] = currentTankCoordinates;
    const { deltaY, deltaX } = projectileDirections[tankOrientation];

    const nextMapState = new Map(currentMapState);

    const traverseShotPath = (y, x, step) => {
        const currentY = originY + deltaY * step;
        const currentX = originX + deltaX * step;
        const cellKey = `${currentY},${currentX}`;
        const cellContent = nextMapState.get(cellKey);

        if (cellContent === '#') {
            return;
        } else if (cellContent === '*') {
            nextMapState.set(cellKey, '.');
            return;
        } else {
            traverseShotPath(y, x, step + 1);
        }
    };

    traverseShotPath(originY, originX, 1);

    return { field: nextMapState, craftPosition: currentTankCoordinates };
};

const executeBattleScenario = (inputSource) => {
    const reader = createInputReader(inputSource);
    let scenarioCount = parseInt(reader.fetchNextLine(), 10);
    const scenarioOutcomes = [];

    for (let s = 0; s < scenarioCount; s++) {
        if (s > 0) {
            scenarioOutcomes.push('');
        }

        const [height, width] = reader.fetchNextLine().split(' ').map(Number);
        let tankCurrentPosition = [0, 0];

        const initialBattlefield = new Map();

        for (let r = 0; r <= height + 1; r++) {
            let rowData = '';
            if (r === 0 || r === height + 1) {
                rowData = '#'.repeat(width + 2);
            } else {
                rowData = '#' + reader.fetchNextLine() + '#';
            }

            for (let c = 0; c <= width + 1; c++) {
                const char = rowData[c];
                initialBattlefield.set(`${r},${c}`, char);
                if (['^', 'v', '<', '>'].includes(char)) {
                    tankCurrentPosition = [r, c];
                }
            }
        }
        reader.fetchNextLine();
        const commandSequence = reader.fetchNextLine().split('');

        const finalBattleState = commandSequence.reduce((accumulator, command) => {
            let { field, craftPosition } = accumulator;
            const [currentY, currentX] = craftPosition;
            const currentTankSymbol = field.get(`${currentY},${currentX}`);

            if (command === 'S') {
                return updateBattlefieldForShot(field, craftPosition, currentTankSymbol);
            } else {
                const direction = movementVectors[command];
                return updateBattlefieldForMovement(field, craftPosition, direction);
            }
        }, { field: initialBattlefield, craftPosition: tankCurrentPosition });

        let formattedOutput = '';
        for (let r = 1; r <= height; r++) {
            let rowCharacters = [];
            for (let c = 1; c <= width; c++) {
                rowCharacters.push(finalBattleState.field.get(`${r},${c}`));
            }
            formattedOutput += rowCharacters.join('');
            if (r < height) {
                formattedOutput += '\n';
            }
        }
        scenarioOutcomes.push(formattedOutput);
    }
    return scenarioOutcomes.join('\n');
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(executeBattleScenario(rawInput));
