const BOARD_ROW_COUNT = 12;
const BOARD_COL_COUNT = 6;
const EMPTY_SPACE = '.';
const ADJACENCY_OFFSETS = [
    [-1, 0], // Up
    [1, 0],  // Down
    [0, -1], // Left
    [0, 1]   // Right
];

function checkBoundary(rCoord, cCoord) {
    return rCoord >= 0 && rCoord < BOARD_ROW_COUNT && cCoord >= 0 && cCoord < BOARD_COL_COUNT;
}

function locateConnectedElements(startR, startC, currentPlayArea) {
    const targetElement = currentPlayArea[startR][startC];
    if (targetElement === EMPTY_SPACE) {
        return { members: new Set(), element: EMPTY_SPACE };
    }

    const explorationQueue = [[startR, startC]];
    const visitedPositions = new Set([`${startR},${startC}`]);
    const connectedMembers = new Set([`${startR},${startC}`]);

    let head = 0;
    while (head < explorationQueue.length) {
        const [currR, currC] = explorationQueue[head++];

        for (const [dr, dc] of ADJACENCY_OFFSETS) {
            const nextR = currR + dr;
            const nextC = currC + dc;
            const nextCoordKey = `${nextR},${nextC}`;

            if (checkBoundary(nextR, nextC) && !visitedPositions.has(nextCoordKey)) {
                visitedPositions.add(nextCoordKey);
                if (currentPlayArea[nextR][nextC] === targetElement) {
                    connectedMembers.add(nextCoordKey);
                    explorationQueue.push([nextR, nextC]);
                }
            }
        }
    }
    return { members: connectedMembers, element: targetElement };
}

function removeAffectedElements(initialPlayArea, elementsToObliterate) {
    let nextPlayArea = initialPlayArea.map(row => [...row]); // Deep copy
    const totalObliteratedElements = new Set(elementsToObliterate);

    // Identify 'O' bombs adjacent to initially obliterated elements
    for (const elementKey of elementsToObliterate) {
        const [r, c] = elementKey.split(',').map(Number);
        for (const [dr, dc] of ADJACENCY_OFFSETS) {
            const nextR = r + dr;
            const nextC = c + dc;
            if (checkBoundary(nextR, nextC) && nextPlayArea[nextR][nextC] === 'O') {
                totalObliteratedElements.add(`${nextR},${nextC}`);
            }
        }
    }

    // Apply obliteration
    for (const elementKey of totalObliteratedElements) {
        const [r, c] = elementKey.split(',').map(Number);
        nextPlayArea[r][c] = EMPTY_SPACE;
    }
    return nextPlayArea;
}

function applyGravitationalPull(currentPlayArea) {
    let shiftedPlayArea = currentPlayArea.map(row => [...row]); // Deep copy

    for (let c = 0; c < BOARD_COL_COUNT; c++) {
        const columnContents = [];
        for (let r = BOARD_ROW_COUNT - 1; r >= 0; r--) {
            if (shiftedPlayArea[r][c] !== EMPTY_SPACE) {
                columnContents.unshift(shiftedPlayArea[r][c]); // Add to the front to maintain top-to-bottom order
            }
        }

        // Fill column from bottom up
        for (let r = BOARD_ROW_COUNT - 1; r >= 0; r--) {
            if (columnContents.length > 0) {
                shiftedPlayArea[r][c] = columnContents.pop(); // Take from the end (which was the top block)
            } else {
                shiftedPlayArea[r][c] = EMPTY_SPACE;
            }
        }
    }
    return shiftedPlayArea;
}

function simulateGameTurn(currentBoardState, accumulatedChainScore) {
    let clustersToExplode = [];
    const processedCells = new Set();

    for (let r = 0; r < BOARD_ROW_COUNT; r++) {
        for (let c = 0; c < BOARD_COL_COUNT; c++) {
            const cellKey = `${r},${c}`;
            if (currentBoardState[r][c] !== EMPTY_SPACE && !processedCells.has(cellKey)) {
                const groupDetails = locateConnectedElements(r, c, currentBoardState);
                
                // Mark all members of this group as processed to avoid re-evaluating
                for (const memberKey of groupDetails.members) {
                    processedCells.add(memberKey);
                }

                if (groupDetails.members.size >= 4) {
                    clustersToExplode.push(groupDetails.members);
                }
            }
        }
    }

    if (clustersToExplode.length === 0) {
        return accumulatedChainScore; // No more chains, game ends for this scenario
    }

    let elementsForThisChainClearance = new Set();
    for (const cluster of clustersToExplode) {
        for (const memberCoord of cluster) {
            elementsForThisChainClearance.add(memberCoord);
        }
    }

    const boardAfterClearing = removeAffectedElements(currentBoardState, elementsForThisChainClearance);
    const boardAfterGravity = applyGravitationalPull(boardAfterClearing);

    return simulateGameTurn(boardAfterGravity, accumulatedChainScore + 1); // Recursive call for next turn
}


const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');

let numGameScenarios = parseInt(inputLines.shift(), 10);

for (let scenarioIdx = 0; scenarioIdx < numGameScenarios; scenarioIdx++) {
    let initialGameGrid = [];
    for (let rowIdx = 0; rowIdx < BOARD_ROW_COUNT; rowIdx++) {
        initialGameGrid.push(inputLines.shift().split(''));
    }

    const finalChainScore = simulateGameTurn(initialGameGrid, 0);
    console.log(finalChainScore);
}