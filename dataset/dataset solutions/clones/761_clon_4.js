const acquireSourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

function* createLineFeeder(sourceText) {
    const contentLines = sourceText.trim().split('\n');
    let feedIndex = 0;
    while (feedIndex < contentLines.length) {
        yield contentLines[feedIndex++];
    }
}

const dataLineProvider = createLineFeeder(acquireSourceData);

function executeAllChallenges() {
    while (true) {
        const sizeEntry = dataLineProvider.next().value;
        const challengeSize = Number(sizeEntry);

        if (challengeSize === 0) {
            break;
        }

        const itemsEntry = dataLineProvider.next().value;
        const challengeElements = itemsEntry.split(' ');

        determineChallengeOutcome(challengeElements, challengeSize);
    }
}

function determineChallengeOutcome(elementCollection, totalItemCount) {
    let scoreRegister = new Map();
    let outcomeDecidedEarly = false;

    for (let currentItemIndex = 0; currentItemIndex < totalItemCount; ++currentItemIndex) {
        const currentItemIdentifier = elementCollection[currentItemIndex];
        const updatedCount = (scoreRegister.get(currentItemIdentifier) || 0) + 1;
        scoreRegister.set(currentItemIdentifier, updatedCount);

        const currentRankings = Array.from(scoreRegister.entries())
            .map(([id, tally]) => ({ identifier: id, tallyValue: tally }))
            .sort((first, second) => second.tallyValue - first.tallyValue);

        const remainingUndeterminedItems = totalItemCount - (currentItemIndex + 1);

        const leadingEntry = currentRankings[0];
        const runnerUpEntry = currentRankings.length > 1 ? currentRankings[1] : { tallyValue: 0, identifier: null };

        if (leadingEntry.tallyValue === runnerUpEntry.tallyValue) {
            continue;
        }

        if (leadingEntry.tallyValue > (runnerUpEntry.tallyValue + remainingUndeterminedItems)) {
            console.log(leadingEntry.identifier, currentItemIndex + 1);
            outcomeDecidedEarly = true;
            break;
        }
    }

    if (!outcomeDecidedEarly) {
        console.log("TIE");
    }
}

executeAllChallenges();