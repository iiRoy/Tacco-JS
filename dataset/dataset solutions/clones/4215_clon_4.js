const fileSystemUtility = require('node:fs');

class DataValueAccessor {
    constructor(sourceData) {
        this.tokenBuffer = sourceData.trim().split(/\s+/g);
    }

    fetchNextNumber() {
        return Number(this.tokenBuffer.shift());
    }

    emptyTokenBuffer() {
        this.tokenBuffer = [];
    }
}

function checkConsecutiveTriplets(inputNumber) {
    const digitRepresentation = String(inputNumber);

    if (digitRepresentation.length < 3) {
        return false;
    }

    const finalState = Array.from(digitRepresentation).reduce((currentAccumulator, currentCharacter) => {
        if (currentAccumulator.foundMatch) {
            return currentAccumulator;
        }

        if (currentCharacter === currentAccumulator.lastObserved) {
            currentAccumulator.streakLength++;
        } else {
            currentAccumulator.lastObserved = currentCharacter;
            currentAccumulator.streakLength = 1;
        }

        if (currentAccumulator.streakLength >= 3) {
            currentAccumulator.foundMatch = true;
        }
        return currentAccumulator;
    }, { foundMatch: false, streakLength: 0, lastObserved: '' });

    return finalState.foundMatch;
}

function initiateProcessing() {
    const inputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

    const primaryDataAccessor = new DataValueAccessor(inputContent);

    const valueToEvaluate = primaryDataAccessor.fetchNextNumber();

    const outcome = checkConsecutiveTriplets(valueToEvaluate);

    console.log(outcome ? "Yes" : "No");
}

initiateProcessing();