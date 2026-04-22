const sourceData = require('node:fs').readFileSync(0, 'utf8');

let classificationTotals = { categoryA: 0, categoryB: 0 };

function processRawSourceIntoNumericTriplets(textBlob) {
    const collectedTriplets = [];
    let currentSegment = '';
    let lineBuffer = [];

    for (let charIndex = 0; charIndex < textBlob.length; ++charIndex) {
        const character = textBlob[charIndex];

        if (character === '\n') {
            // Process the current line
            if (currentSegment.trim() !== '') {
                lineBuffer.push(Number.parseFloat(currentSegment)); // Add the last number in the line
                if (lineBuffer.length === 3) { // Ensure it's a valid triplet
                    collectedTriplets.push(lineBuffer);
                }
            }
            currentSegment = '';
            lineBuffer = [];
        } else if (character === ',') {
            lineBuffer.push(Number.parseFloat(currentSegment));
            currentSegment = '';
        } else {
            currentSegment += character;
        }
    }

    // Handle any remaining content after the last newline (or if no newlines)
    if (currentSegment.trim() !== '') {
        lineBuffer.push(Number.parseFloat(currentSegment));
        if (lineBuffer.length === 3) {
            collectedTriplets.push(lineBuffer);
        }
    }
    return collectedTriplets;
}

function evaluateTriplet(numericTuple) {
    if (numericTuple.length !== 3) {
        return; // Skip malformed data
    }
    const primaryValue = numericTuple[0];
    const secondaryValue = numericTuple[1];
    const tertiaryValue = numericTuple[2];

    const primarySquared = primaryValue * primaryValue;
    const secondarySquared = secondaryValue * secondaryValue;
    const tertiarySquared = tertiaryValue * tertiaryValue;

    if (tertiarySquared - secondarySquared - primarySquared === 0) {
        classificationTotals.categoryA++;
    } else if (secondaryValue === primaryValue) {
        classificationTotals.categoryB++;
    }
    // No action for the third case (not Pythagorean, primaryValue != secondaryValue)
}

function recursivelyProcessData(dataCollection, currentIndex) {
    if (currentIndex >= dataCollection.length) {
        return; // Base case: all data processed
    }
    evaluateTriplet(dataCollection[currentIndex]);
    recursivelyProcessData(dataCollection, currentIndex + 1); // Recursive step
}

const parsedNumericData = processRawSourceIntoNumericTriplets(sourceData);
recursivelyProcessData(parsedNumericData, 0);

process.stdout.write(classificationTotals.categoryA + '\n' + classificationTotals.categoryB);