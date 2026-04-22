const BOARD_DIMENSION = 8;
const EMPTY_SLOT = 0;
const PLAYER_A_SYMBOL = 1; // Represents 'o'
const PLAYER_B_SYMBOL = -1; // Represents 'x'

const NAVIGATIONAL_DELTAS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

function initializeGameGrid(inputString) {
    const gameLayout = Array.from({ length: BOARD_DIMENSION }, () => Array(BOARD_DIMENSION).fill(EMPTY_SLOT));
    let initialOccupiedCount = 0;

    const lines = inputString.split("\n");

    for (let rowIndex = 0; rowIndex < BOARD_DIMENSION; rowIndex++) {
        for (let colIndex = 0; colIndex < BOARD_DIMENSION; colIndex++) {
            const character = lines[rowIndex][colIndex];
            if (character === 'o') {
                gameLayout[rowIndex][colIndex] = PLAYER_A_SYMBOL;
                initialOccupiedCount++;
            } else if (character === 'x') {
                gameLayout[rowIndex][colIndex] = PLAYER_B_SYMBOL;
                initialOccupiedCount++;
            }
        }
    }
    return { layout: gameLayout, count: initialOccupiedCount };
}

function checkBounds(r, c) {
    return r >= 0 && r < BOARD_DIMENSION && c >= 0 && c < BOARD_DIMENSION;
}

function getFlippablePiecesInDirection(currentLayout, activeParticipant, startR, startC, rowChange, colChange) {
    const potentialFlips = [];
    let currentR = startR + rowChange;
    let currentC = startC + colChange;

    while (checkBounds(currentR, currentC)) {
        const slotValue = currentLayout[currentR][currentC];

        if (slotValue === EMPTY_SLOT) {
            return [];
        } else if (slotValue === activeParticipant) {
            return potentialFlips;
        } else {
            potentialFlips.push({ r: currentR, c: currentC });
        }
        currentR += rowChange;
        currentC += colChange;
    }
    return [];
}

function calculateMoveScore(currentLayout, activeParticipant, intendedR, intendedC) {
    let score = 0;
    for (const [dr, dc] of NAVIGATIONAL_DELTAS) {
        const flipsInThisDirection = getFlippablePiecesInDirection(currentLayout, activeParticipant, intendedR, intendedC, dr, dc);
        score += flipsInThisDirection.length;
    }
    return score;
}

function executeMove(originalLayout, activeParticipant, placementR, placementC) {
    const updatedLayout = originalLayout.map(row => [...row]);

    updatedLayout[placementR][placementC] = activeParticipant;

    for (const [dr, dc] of NAVIGATIONAL_DELTAS) {
        const piecesToFlip = getFlippablePiecesInDirection(originalLayout, activeParticipant, placementR, placementC, dr, dc);
        for (const { r, c } of piecesToFlip) {
            updatedLayout[r][c] = activeParticipant;
        }
    }
    return updatedLayout;
}

function findBestAction(layoutSnapshot, participantIdentity) {
    const candidateActions = [];

    for (let r = 0; r < BOARD_DIMENSION; r++) {
        for (let c = 0; c < BOARD_DIMENSION; c++) {
            if (layoutSnapshot[r][c] === EMPTY_SLOT) {
                const estimatedCaptures = calculateMoveScore(layoutSnapshot, participantIdentity, r, c);
                if (estimatedCaptures > 0) {
                    candidateActions.push({ r: r, c: c, captures: estimatedCaptures });
                }
            }
        }
    }

    if (candidateActions.length === 0) {
        return null;
    }

    const optimalAction = candidateActions.reduce((currentBest, currentPotential) => {
        if (currentBest === null) return currentPotential;

        if (participantIdentity === PLAYER_A_SYMBOL) {
            if (currentPotential.captures > currentBest.captures) {
                return currentPotential;
            }
            return currentBest;
        } else {
            if (currentPotential.captures >= currentBest.captures) {
                return currentPotential;
            }
            return currentBest;
        }
    }, null);

    return optimalAction;
}

function runReversiGame(inputContent) {
    let { layout: currentLayoutState, count: totalFilledSlots } = initializeGameGrid(inputContent);
    let currentPlayer = PLAYER_A_SYMBOL;
    let successivePasses = 0;

    while (totalFilledSlots < BOARD_DIMENSION * BOARD_DIMENSION && successivePasses < 2) {
        const chosenAction = findBestAction(currentLayoutState, currentPlayer);

        if (chosenAction === null) {
            successivePasses++;
        } else {
            successivePasses = 0;
            currentLayoutState = executeMove(currentLayoutState, currentPlayer, chosenAction.r, chosenAction.c);
            totalFilledSlots++;
        }
        currentPlayer *= -1;
    }

    const finalBoardRepresentation = [];
    for (let r = 0; r < BOARD_DIMENSION; r++) {
        let rowOutput = "";
        for (let c = 0; c < BOARD_DIMENSION; c++) {
            const cellContent = currentLayoutState[r][c];
            if (cellContent === PLAYER_A_SYMBOL) {
                rowOutput += 'o';
            } else if (cellContent === PLAYER_B_SYMBOL) {
                rowOutput += 'x';
            } else {
                rowOutput += '.';
            }
        }
        finalBoardRepresentation.push(rowOutput);
    }
    console.log(finalBoardRepresentation.join("\n"));
}

runReversiGame(require("fs").readFileSync("/dev/stdin","utf8"));