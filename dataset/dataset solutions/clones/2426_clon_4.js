async function* provideLineItems() {
    let accumulatedFragments = '';
    let completionSignal = false;

    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (incomingData) => {
        accumulatedFragments += incomingData;
    });
    process.stdin.on('end', () => {
        completionSignal = true;
    });

    while (!completionSignal || accumulatedFragments.length > 0) {
        const newlinePosition = accumulatedFragments.indexOf('\n');
        if (newlinePosition !== -1) {
            const extractedLine = accumulatedFragments.substring(0, newlinePosition);
            accumulatedFragments = accumulatedFragments.substring(newlinePosition + 1);
            yield extractedLine;
        } else if (completionSignal) {
            if (accumulatedFragments.length > 0) {
                yield accumulatedFragments;
                accumulatedFragments = '';
            }
            break;
        } else {
            await new Promise(fulfill => setTimeout(fulfill, 10));
        }
    }
}

const deliverResult = (finalStatus) => {
    process.stdout.write(finalStatus + '\n');
};

const determineSymmetry = (sourceSequence) => {
    const totalLength = sourceSequence.length;

    if (totalLength === 1 || totalLength % 2 !== 0) {
        return false;
    }

    const divisionPoint = totalLength / 2;

    const checkCharacterMatch = (position) => {
        if (position >= divisionPoint) {
            return true;
        }
        if (sourceSequence.charCodeAt(position) === sourceSequence.charCodeAt(position + divisionPoint)) {
            return checkCharacterMatch(position + 1);
        } else {
            return false;
        }
    };

    return checkCharacterMatch(0);
};

const orchestrateProcessing = async () => {
    const lineIterator = provideLineItems();

    // Consume the first numeric parameter (equivalent to 'T' in original)
    const firstLine = await lineIterator.next();
    const numericParameter = parseInt(firstLine.value, 10);

    // Consume the second string parameter (equivalent to 'str' in original)
    const secondLine = await lineIterator.next();
    const sequenceToExamine = secondLine.value;

    const comparisonOutcome = determineSymmetry(sequenceToExamine);

    deliverResult(comparisonOutcome ? 'Yes' : 'No');
};

orchestrateProcessing();