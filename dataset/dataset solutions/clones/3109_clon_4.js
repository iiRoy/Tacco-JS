const initiateProcessing = (inputDataBundle) => {
    try {
        const numericalElements = parseInputText(inputDataBundle);
        const finalResultSeries = evaluateAndConstruct(numericalElements);

        if (finalResultSeries.length === 1 && finalResultSeries[0] === -1) {
            process.stdout.write("-1\n");
        } else {
            process.stdout.write(finalResultSeries.join("\n") + "\n");
        }
    } catch (e) {
        // Replicate original error message for specific TypeError
        if (e instanceof TypeError && e.message.includes("Cannot read properties of undefined (reading 'split')")) {
            throw e; 
        }
        // For other unexpected errors, default Node.js error handling will apply
        throw e;
    }
};

const parseInputText = (fullTextContent) => {
    let textLines = [];
    let currentSegment = '';
    for (let i = 0; i < fullTextContent.length; ++i) {
        let char = fullTextContent[i];
        if (char === '\n') {
            textLines.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += char;
        }
    }
    // Handle the last line, even if it's empty or doesn't end with a newline
    if (currentSegment.length > 0 || (fullTextContent.length > 0 && fullTextContent.endsWith('\n'))) {
        textLines.push(currentSegment);
    } else if (fullTextContent.length === 0) { // Special case for completely empty input
        textLines = []; 
    }

    if (textLines.length < 2) {
        // This mirrors the original's error: `undefined.split(' ')`
        throw new TypeError("Cannot read properties of undefined (reading 'split')");
    }

    const relevantLine = textLines[1];
    let simulatedSplit = [];
    let temporaryWord = '';
    for (let k = 0; k < relevantLine.length; ++k) {
        if (relevantLine[k] === ' ') {
            simulatedSplit.push(temporaryWord);
            temporaryWord = '';
        } else {
            temporaryWord += relevantLine[k];
        }
    }
    simulatedSplit.push(temporaryWord); // Push the last part

    return simulatedSplit.map(s => parseInt(s, 10));
};

const evaluateAndConstruct = (numericElements) => {
    const initialAccumulatorState = {
        finalCollection: [],
        problemDetected: false
    };

    const outcome = numericElements.reduce((cumulativeState, currentElement, currentPosition) => {
        if (cumulativeState.problemDetected) {
            return cumulativeState; 
        }

        const positionalThreshold = currentPosition + 1;
        if (currentElement > positionalThreshold) {
            return {
                finalCollection: [], 
                problemDetected: true
            };
        }

        // Simulate `array.splice(index, 0, item)` by creating a new array
        const insertionSpot = currentElement - 1;
        const modifiedCollection = [
            ...cumulativeState.finalCollection.slice(0, insertionSpot),
            currentElement,
            ...cumulativeState.finalCollection.slice(insertionSpot)
        ];

        return {
            finalCollection: modifiedCollection,
            problemDetected: false
        };

    }, initialAccumulatorState);

    if (outcome.problemDetected) {
        return [-1]; 
    } else {
        return outcome.finalCollection;
    }
};

initiateProcessing(require('node:fs').readFileSync(0, 'utf8'));