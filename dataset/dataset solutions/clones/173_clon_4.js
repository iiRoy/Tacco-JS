const fileSystem = require('fs');

function convertHandToFrequencyMap(handStringRepresentation) {
    const tileFrequencyMap = new Map();
    for (const digitCharacter of handStringRepresentation) {
        const tileNumericValue = parseInt(digitCharacter, 10);
        tileFrequencyMap.set(tileNumericValue, (tileFrequencyMap.get(tileNumericValue) || 0) + 1);
    }
    return tileFrequencyMap;
}

function canDecomposeRemainingTiles(currentTileFrequencies) {
    let lowestTilePresent = -1;
    for (let tileIdentifier = 1; tileIdentifier <= 9; tileIdentifier++) {
        if ((currentTileFrequencies.get(tileIdentifier) || 0) > 0) {
            lowestTilePresent = tileIdentifier;
            break;
        }
    }

    if (lowestTilePresent === -1) {
        return true; // All tiles successfully decomposed
    }

    // Attempt to form a triplet (kotsu) with the lowestTilePresent
    if ((currentTileFrequencies.get(lowestTilePresent) || 0) >= 3) {
        const afterTripletRemoval = new Map(currentTileFrequencies);
        afterTripletRemoval.set(lowestTilePresent, afterTripletRemoval.get(lowestTilePresent) - 3);
        if (canDecomposeRemainingTiles(afterTripletRemoval)) {
            return true;
        }
    }

    // Attempt to form a sequence (shuntsu) with the lowestTilePresent
    if (lowestTilePresent <= 7 &&
        (currentTileFrequencies.get(lowestTilePresent) || 0) >= 1 &&
        (currentTileFrequencies.get(lowestTilePresent + 1) || 0) >= 1 &&
        (currentTileFrequencies.get(lowestTilePresent + 2) || 0) >= 1) {

        const afterSequenceRemoval = new Map(currentTileFrequencies);
        afterSequenceRemoval.set(lowestTilePresent, afterSequenceRemoval.get(lowestTilePresent) - 1);
        afterSequenceRemoval.set(lowestTilePresent + 1, afterSequenceRemoval.get(lowestTilePresent + 1) - 1);
        afterSequenceRemoval.set(lowestTilePresent + 2, afterSequenceRemoval.get(lowestTilePresent + 2) - 1);
        if (canDecomposeRemainingTiles(afterSequenceRemoval)) {
            return true;
        }
    }

    return false; // Cannot decompose this configuration
}

function determineWinningTilesForHand(inputHandLine) {
    const initialTileCounts = convertHandToFrequencyMap(inputHandLine);
    const possibleWinningTiles = new Set();

    for (let potentialDraw = 1; potentialDraw <= 9; potentialDraw++) {
        const currentCountOfDraw = initialTileCounts.get(potentialDraw) || 0;
        const countOfPrevTile = initialTileCounts.get(potentialDraw - 1) || 0;
        const countOfNextTile = initialTileCounts.get(potentialDraw + 1) || 0;

        // Skip if already 4 of this tile, or if this tile and its neighbors are all absent
        if (currentCountOfDraw === 4 || (countOfPrevTile === 0 && currentCountOfDraw === 0 && countOfNextTile === 0)) {
            continue;
        }

        for (let candidatePairTile = 1; candidatePairTile <= 9; candidatePairTile++) {
            const simulatedHandCounts = new Map(initialTileCounts);

            // Add the potential drawn tile
            simulatedHandCounts.set(potentialDraw, (simulatedHandCounts.get(potentialDraw) || 0) + 1);

            // Check if the candidatePairTile can form a pair
            if ((simulatedHandCounts.get(candidatePairTile) || 0) < 2) {
                continue;
            }

            // Remove the pair
            simulatedHandCounts.set(candidatePairTile, simulatedHandCounts.get(candidatePairTile) - 2);

            // Check if the remaining tiles can be decomposed into melds
            if (canDecomposeRemainingTiles(simulatedHandCounts)) {
                possibleWinningTiles.add(potentialDraw);
                break; // Found a valid pair for this potentialDraw, move to the next potentialDraw
            }
        }
    }

    const sortedResults = Array.from(possibleWinningTiles).sort((a, b) => a - b);
    return sortedResults.length ? sortedResults.join(' ') : '0';
}

function executeGameLogic() {
    const rawInputContent = fileSystem.readFileSync(0, 'utf8');
    const gameInputLines = rawInputContent.trim().split('\n');

    const allResults = gameInputLines.map(determineWinningTilesForHand);
    allResults.forEach(outputLine => console.log(outputLine));
}

executeGameLogic();
