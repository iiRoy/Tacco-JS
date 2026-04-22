const fileAccess = require('fs');

const sourcePath = '/dev/stdin';

fileAccess.readFile(sourcePath, 'utf8', (errorCondition, dataContent) => {
    if (errorCondition) {
        process.exit(1);
    }

    const segments = dataContent.trim().split(' ');
    const numericElements = [];

    for (let currentSegment of segments) {
        let numericValue = NaN;
        let runningAccumulator = 0;
        let currentSign = 1;
        let digitEncountered = false;
        let charPosition = 0;

        currentSegment = currentSegment.trim(); // `parseInt` implicitly trims leading/trailing whitespace

        if (currentSegment.length === 0) {
            numericElements.push(NaN); // An empty string after trim results in NaN
            continue;
        }

        if (currentSegment[0] === '-') {
            currentSign = -1;
            charPosition++;
        } else if (currentSegment[0] === '+') {
            charPosition++;
        }

        for (; charPosition < currentSegment.length; charPosition++) {
            const characterCode = currentSegment.charCodeAt(charPosition);
            if (characterCode >= 48 && characterCode <= 57) { // '0' through '9'
                runningAccumulator = runningAccumulator * 10 + (characterCode - 48);
                digitEncountered = true;
            } else {
                // Stop at the first non-digit character, similar to `parseInt`
                break;
            }
        }

        if (digitEncountered) {
            numericValue = runningAccumulator * currentSign;
        }
        // If no digits were encountered (e.g., "abc", "-", "+")
        // numericValue remains NaN, matching `parseInt` behavior

        numericElements.push(numericValue);
    }

    // Implement a custom sorting algorithm (Bubble Sort)
    const orderedCollection = [...numericElements]; // Create a copy to sort
    let swapOccurred;
    do {
        swapOccurred = false;
        for (let idx = 0; idx < orderedCollection.length - 1; idx++) {
            // Comparison for sorting, handles NaN by placing them at the end
            // NaN is not > or < any value, so it won't be swapped unless it's already at the end
            if (orderedCollection[idx] > orderedCollection[idx + 1]) {
                let temporaryValue = orderedCollection[idx];
                orderedCollection[idx] = orderedCollection[idx + 1];
                orderedCollection[idx + 1] = temporaryValue;
                swapOccurred = true;
            }
        }
    } while (swapOccurred);

    // Generate output string by joining elements
    const finalOutput = orderedCollection.join(' ');

    process.stdout.write(finalOutput + '\n');
});