'use strict';

const ingestRawMaterial = (sourceStream) => {
    const tokenizedSegments = sourceStream.split(/\s+/).filter(Boolean);
    const parsedQuantities = [];
    for (let segmentIdx = 0; segmentIdx < tokenizedSegments.length; segmentIdx++) {
        parsedQuantities.push(Number(tokenizedSegments[segmentIdx]));
    }
    return parsedQuantities;
};

const determineOutcome = (pileState, allowedDecrements, memoizedResults) => {
    if (pileState < 0) {
        return false; 
    }
    if (pileState === 0) {
        // Base condition: no items left, current player has no moves, thus loses
        return false;
    }
    if (memoizedResults[pileState] !== undefined) {
        // Return previously computed result from cache
        return memoizedResults[pileState];
    }

    let canSecureVictory = false;
    for (let decrementIdx = 0; decrementIdx < allowedDecrements.length; decrementIdx++) {
        const currentDecrement = allowedDecrements[decrementIdx];
        if (pileState - currentDecrement >= 0) {
            // If moving to 'pileState - currentDecrement' causes the *next* player to lose,
            // then the current player wins by making this move.
            if (!determineOutcome(pileState - currentDecrement, allowedDecrements, memoizedResults)) {
                canSecureVictory = true;
                break; // Found a winning move, no need to explore other options
            }
        }
    }

    memoizedResults[pileState] = canSecureVictory;
    return canSecureVictory;
};

const processedData = ingestRawMaterial(require('fs').readFileSync('/dev/stdin', 'utf8'));
const maxMoveOptions = processedData[0]; // N from original, not directly used in this implementation's logic
const initialPileSize = processedData[1]; // K from original
const validMoveDecrements = processedData.slice(2); // A from original

// Initialize a cache for game states up to initialPileSize
// `undefined` signifies that a state has not yet been computed.
const computedGameStates = new Array(initialPileSize + 1).fill(undefined);

const primaryPlayerVictorious = determineOutcome(initialPileSize, validMoveDecrements, computedGameStates);

if (primaryPlayerVictorious) {
    console.log('Player One');
} else {
    console.log('Player Two');
}