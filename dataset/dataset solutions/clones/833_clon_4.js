const ROWS_COUNT = 12;
const COLS_COUNT = 6;
const MOVEMENT_VECTORS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

function isWithinBounds(r, c) {
    return r >= 0 && r < ROWS_COUNT && c >= 0 && c < COLS_COUNT;
}

function traverseAndIdentifyRegion(initialR, initialC, targetHue, currentLayout) {
    const regionMembers = new Set();
    const explorationQueue = [{ r: initialR, c: initialC }];
    const alreadyProcessed = new Set([`${initialR},${initialC}`]);

    if (currentLayout[initialR][initialC] !== targetHue) {
        return regionMembers;
    }
    regionMembers.add(`${initialR},${initialC}`);

    while (explorationQueue.length > 0) {
        const { r, c } = explorationQueue.shift();

        for (const [dr, dc] of MOVEMENT_VECTORS) {
            const nextR = r + dr;
            const nextC = c + dc;
            const neighborKey = `${nextR},${nextC}`;

            if (isWithinBounds(nextR, nextC) &&
                currentLayout[nextR][nextC] === targetHue &&
                !alreadyProcessed.has(neighborKey)) {
                
                alreadyProcessed.add(neighborKey);
                regionMembers.add(neighborKey);
                explorationQueue.push({ r: nextR, c: nextC });
            }
        }
    }
    return regionMembers;
}

function findCandidatesForRemoval(currentLayout) {
    const allRemovableTargets = new Set();
    const cellsCheckedForGroup = new Set();

    for (let r = 0; r < ROWS_COUNT; r++) {
        for (let c = 0; c < COLS_COUNT; c++) {
            const cellIdentifier = `${r},${c}`;
            const cellContent = currentLayout[r][c];

            if (cellContent !== '.' && cellContent !== 'O' && !cellsCheckedForGroup.has(cellIdentifier)) {
                const potentialGroup = traverseAndIdentifyRegion(r, c, cellContent, currentLayout);
                
                potentialGroup.forEach(coord => cellsCheckedForGroup.add(coord));

                if (potentialGroup.size >= 4) {
                    potentialGroup.forEach(coord => allRemovableTargets.add(coord));
                }
            }
        }
    }
    return allRemovableTargets;
}

function processRemovalAndAdjacentBlocks(initialLayout, cellsToDissolve) {
    const updatedLayout = initialLayout.map(row => [...row]);
    const secondaryClearances = new Set();

    cellsToDissolve.forEach(coordString => {
        const [r, c] = coordString.split(',').map(Number);
        updatedLayout[r][c] = '.';

        for (const [dr, dc] of MOVEMENT_VECTORS) {
            const nextR = r + dr;
            const nextC = c + dc;
            if (isWithinBounds(nextR, nextC) && updatedLayout[nextR][nextC] === 'O') {
                secondaryClearances.add(`${nextR},${nextC}`);
            }
        }
    });

    secondaryClearances.forEach(coordString => {
        const [r, c] = coordString.split(',').map(Number);
        updatedLayout[r][c] = '.';
    });

    return updatedLayout;
}

function applyDownwardMotion(initialLayout) {
    const postMotionLayout = Array.from({ length: ROWS_COUNT }, () => Array(COLS_COUNT).fill('.'));

    for (let c = 0; c < COLS_COUNT; c++) {
        const columnContents = [];
        for (let r = ROWS_COUNT - 1; r >= 0; r--) {
            if (initialLayout[r][c] !== '.') {
                columnContents.push(initialLayout[r][c]);
            }
        }
        for (let r = 0; r < columnContents.length; r++) {
            postMotionLayout[ROWS_COUNT - 1 - r][c] = columnContents[r];
        }
    }
    return postMotionLayout;
}

function executeGameCycle(initialBoard) {
    let currentBoardState = initialBoard;
    let cycleTally = 0;

    while (true) {
        const targetsForRemoval = findCandidatesForRemoval(currentBoardState);

        if (targetsForRemoval.size === 0) {
            break;
        }

        cycleTally++;
        
        let boardAfterRemovals = processRemovalAndAdjacentBlocks(currentBoardState, targetsForRemoval);
        currentBoardState = applyDownwardMotion(boardAfterRemovals);
    }
    return cycleTally;
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputContent.trim().split("\n");
const totalScenarios = parseInt(lineSegments.shift(), 10);

for (let scenarioNumber = 0; scenarioNumber < totalScenarios; scenarioNumber++) {
    const initialBoardConfiguration = [];
    for (let rowIterator = 0; rowIterator < ROWS_COUNT; rowIterator++) {
        initialBoardConfiguration.push(lineSegments.shift().split(""));
    }
    
    const finalCycleCount = executeGameCycle(initialBoardConfiguration);
    console.log(finalCycleCount);
}