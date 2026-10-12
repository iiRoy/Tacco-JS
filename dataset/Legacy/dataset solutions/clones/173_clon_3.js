const fs = require('fs');

function readInputLines() {
    const inputByteLength = fs.fstatSync(process.stdin.fd).size;
    const inputBuffer = Buffer.alloc(inputByteLength);
    const bytesReadCount = fs.readSync(process.stdin.fd, inputBuffer, 0, inputByteLength, 0);
    const rawInputContent = inputBuffer.toString('utf8', 0, bytesReadCount);
    return rawInputContent.trim().split('\n');
}

function executeHandProcessing() {
    const allInputHands = readInputLines();

    for (let handIdx = 0; handIdx < allInputHands.length; handIdx++) {
        const currentHandString = allInputHands[handIdx];
        const potentialDiscards = determineValidDiscards(currentHandString);

        if (potentialDiscards.length > 0) {
            console.log(potentialDiscards.join(' '));
        } else {
            console.log('0');
        }
    }
}

function determineValidDiscards(handRepresentation) {
    const handCharacters = handRepresentation.split('');
    const initialCardCounts = generateCardFrequencies(handCharacters);
    const validDiscardOptions = [];

    DISCARD_CANDIDATE_ITERATION:
    for (let discardValue = 1; discardValue <= 9; discardValue++) {
        const currentDiscardCount = initialCardCounts[discardValue];
        const previousCardCount = initialCardCounts[discardValue - 1];
        const subsequentCardCount = initialCardCounts[discardValue + 1];

        // Skip if discarding a card that's already a triplet of 4,
        // or if it's a card that doesn't exist and can't form a sequence around it.
        if (currentDiscardCount === 4 || (previousCardCount === 0 && currentDiscardCount === 0 && subsequentCardCount === 0)) {
            continue;
        }

        for (let pairValue = 1; pairValue <= 9; pairValue++) {
            const currentPairCount = initialCardCounts[pairValue];
            if (currentPairCount === 0) {
                continue; // Cannot form a pair with a card not in hand
            }

            const temporaryCardCounts = initialCardCounts.slice(0); // Create a mutable copy
            temporaryCardCounts[discardValue]++; // Add the "discarded" card back
            temporaryCardCounts[pairValue] -= 2; // Remove the two cards for the pair

            const remainingCardsAfterMelds = calculateRemainingAfterMeldFormation(temporaryCardCounts);

            if (remainingCardsAfterMelds === 0) {
                validDiscardOptions.push(discardValue);
                continue DISCARD_CANDIDATE_ITERATION; // Found a valid discard, move to the next discard candidate
            }
        }
    }
    return validDiscardOptions;
}

function generateCardFrequencies(cardChars) {
    const frequenciesArray = new Array(11).fill(0); // Index 0 and 10 are unused, 1-9 for card values
    for (let charIndex = 0; charIndex < cardChars.length; charIndex++) {
        const cardNumericValue = parseInt(cardChars[charIndex], 10);
        frequenciesArray[cardNumericValue]++;
    }
    return frequenciesArray;
}

function calculateRemainingAfterMeldFormation(currentFrequencies) {
    const mutableFrequencies = currentFrequencies.slice(0); // Work on a copy

    for (let cardVal = 1; cardVal <= 9; cardVal++) {
        // Attempt to form sequences (l-1, l, l+1)
        // Original logic attempts twice for sequences
        if (mutableFrequencies[cardVal - 1] >= 1 && mutableFrequencies[cardVal] >= 1 && mutableFrequencies[cardVal + 1] >= 1) {
            mutableFrequencies[cardVal - 1]--;
            mutableFrequencies[cardVal]--;
            mutableFrequencies[cardVal + 1]--;
        }
        if (mutableFrequencies[cardVal - 1] >= 1 && mutableFrequencies[cardVal] >= 1 && mutableFrequencies[cardVal + 1] >= 1) {
            mutableFrequencies[cardVal - 1]--;
            mutableFrequencies[cardVal]--;
            mutableFrequencies[cardVal + 1]--;
        }
        
        // Attempt to form triplets (l, l, l)
        if (mutableFrequencies[cardVal] >= 3) {
            mutableFrequencies[cardVal] -= 3;
        }
    }

    let totalRemainingCards = 0;
    for (let cardVal = 1; cardVal <= 9; cardVal++) {
        totalRemainingCards += mutableFrequencies[cardVal];
    }
    return totalRemainingCards;
}

executeHandProcessing();
