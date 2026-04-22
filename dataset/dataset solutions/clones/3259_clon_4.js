process.stdin.resume();
process.stdin.setEncoding('utf8');
let inputBuffer = '';

process.stdin.on('data', function(chunkData) {
    inputBuffer += chunkData;
});

process.stdin.on('end', function() {
    const textLines = inputBuffer.split("\n");
    const elementCount = parseInt(textLines[0], 10);
    const tokenStrings = textLines[1].split(" ");
    const initialValues = Array.from({ length: elementCount }, (_, index) => parseInt(tokenStrings[index], 10));

    const finalTally = calculateTotalDecrement(initialValues, 0);
    console.log(finalTally);
});

function calculateTotalDecrement(currentNumericCollection, accumulatedSum) {
    function processDecrementRound(currentPosition, roundCollection, roundSum, roundHasModified) {
        if (currentPosition >= roundCollection.length) {
            return {
                collection: roundCollection,
                sum: roundSum,
                modified: roundHasModified
            };
        }

        let iterationCollection = [...roundCollection];
        let iterationSum = roundSum;
        let iterationModified = roundHasModified;

        if (iterationCollection[currentPosition] > 0) {
            iterationCollection[currentPosition]--;
            iterationSum++;
            iterationModified = true;

            function applySubsequentDecrements(subPosition, workingCollection, sourceElementValue) {
                if (subPosition >= workingCollection.length) {
                    return workingCollection;
                }
                if (sourceElementValue <= workingCollection[subPosition]) {
                    workingCollection[subPosition]--;
                    return applySubsequentDecrements(subPosition + 1, workingCollection, sourceElementValue);
                } else {
                    return workingCollection;
                }
            }
            iterationCollection = applySubsequentDecrements(currentPosition + 1, iterationCollection, iterationCollection[currentPosition]);
        }
        
        return processDecrementRound(currentPosition + 1, iterationCollection, iterationSum, iterationModified);
    }

    const roundOutcome = processDecrementRound(0, currentNumericCollection, accumulatedSum, false);

    if (roundOutcome.modified) {
        return calculateTotalDecrement(roundOutcome.collection, roundOutcome.sum);
    } else {
        return roundOutcome.sum;
    }
}