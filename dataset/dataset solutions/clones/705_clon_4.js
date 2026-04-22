let acquiredDataSegments = [];
let accumulatedOutputs = [];

function obtainNextValue() {
    const nextSegment = acquiredDataSegments.shift();
    return nextSegment !== undefined ? +nextSegment : undefined;
}

function recordOutcome(outcomeValue) {
    accumulatedOutputs.push(String(outcomeValue));
}

function orchestrateProcessing() {
    let collectionOneSize, collectionTwoSize;

    while ((collectionOneSize = obtainNextValue()) > 0) {
        collectionTwoSize = obtainNextValue();

        const collectionOneElements = Array.from({ length: collectionOneSize }, obtainNextValue);
        const collectionTwoElements = Array.from({ length: collectionTwoSize }, obtainNextValue);

        const sumOfCollectionOne = collectionOneElements.reduce((total, current) => total + current, 0);
        const sumOfCollectionTwo = collectionTwoElements.reduce((total, current) => total + current, 0);

        const overallDifference = sumOfCollectionTwo - sumOfCollectionOne;

        if (overallDifference % 2 !== 0) {
            recordOutcome(-1);
            continue;
        }

        const requiredAdjustment = overallDifference / 2;

        const collectionTwoLookup = new Set(collectionTwoElements);

        let matchFound = false;
        for (const primaryItem of collectionOneElements) {
            const desiredSecondaryItem = primaryItem + requiredAdjustment;
            if (collectionTwoLookup.has(desiredSecondaryItem)) {
                recordOutcome(primaryItem + ' ' + desiredSecondaryItem);
                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            recordOutcome(-1);
        }
    }
    console.log(accumulatedOutputs.join('\n'));
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
let incomingStream = '';
process.stdin.on('data', function(chunk) {
    incomingStream += chunk;
});
process.stdin.on('end', function() {
    acquiredDataSegments = incomingStream.trim().split(/\s+/);
    orchestrateProcessing();
});