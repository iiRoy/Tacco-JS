const RDL = require('readline');

const IO = RDL.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const gameSessions = [];

IO.on('line', (dataLine) => {
    if (dataLine.trim() !== '') {
        gameSessions.push(dataLine.trim());
    }
});

IO.on('close', () => {
    handleAllSessions(gameSessions);
});

function handleAllSessions(allInputs) {
    const finalOutcomes = [];

    allInputs.forEach(singleSessionTiles => {
        const initialFrequencies = new Map();
        for (let digitChar of singleSessionTiles) {
            const tileValue = parseInt(digitChar, 10);
            initialFrequencies.set(tileValue, (initialFrequencies.get(tileValue) || 0) + 1);
        }

        const winningCandidates = [];
        
        for (let candidateTile = 1; candidateTile <= 9; candidateTile++) {
            const currentHandFrequencies = new Map(initialFrequencies);
            currentHandFrequencies.set(candidateTile, (currentHandFrequencies.get(candidateTile) || 0) + 1);

            let foundCompletionForCandidate = false;

            for (let pairFormingTile = 1; pairFormingTile <= 9; pairFormingTile++) {
                if ((currentHandFrequencies.get(pairFormingTile) || 0) >= 2) {
                    const afterPairRemoval = new Map(currentHandFrequencies);
                    afterPairRemoval.set(pairFormingTile, afterPairRemoval.get(pairFormingTile) - 2);

                    if (canReduceToZero(afterPairRemoval)) {
                        winningCandidates.push(candidateTile);
                        foundCompletionForCandidate = true;
                        break;
                    }
                }
            }
        }
        
        if (winningCandidates.length > 0) {
            finalOutcomes.push(winningCandidates.join(' '));
        } else {
            finalOutcomes.push('0');
        }
    });

    finalOutcomes.forEach(outcome => console.log(outcome));
}

function canReduceToZero(tileFrequencyMap) {
    let firstExistingTile = -1;
    for (let currentTileVal = 1; currentTileVal <= 9; currentTileVal++) {
        if ((tileFrequencyMap.get(currentTileVal) || 0) > 0) {
            firstExistingTile = currentTileVal;
            break;
        }
    }

    if (firstExistingTile === -1) {
        return true;
    }

    if ((tileFrequencyMap.get(firstExistingTile) || 0) >= 3) {
        const afterTripletAttempt = new Map(tileFrequencyMap);
        afterTripletAttempt.set(firstExistingTile, afterTripletAttempt.get(firstExistingTile) - 3);
        if (canReduceToZero(afterTripletAttempt)) {
            return true;
        }
    }

    if (firstExistingTile <= 7 && 
        (tileFrequencyMap.get(firstExistingTile) || 0) >= 1 &&
        (tileFrequencyMap.get(firstExistingTile + 1) || 0) >= 1 &&
        (tileFrequencyMap.get(firstExistingTile + 2) || 0) >= 1) {
        
        const afterSequenceAttempt = new Map(tileFrequencyMap);
        afterSequenceAttempt.set(firstExistingTile, afterSequenceAttempt.get(firstExistingTile) - 1);
        afterSequenceAttempt.set(firstExistingTile + 1, afterSequenceAttempt.get(firstExistingTile + 1) - 1);
        afterSequenceAttempt.set(firstExistingTile + 2, afterSequenceAttempt.get(firstExistingTile + 2) - 1);
        
        if (canReduceToZero(afterSequenceAttempt)) {
            return true;
        }
    }

    return false;
}