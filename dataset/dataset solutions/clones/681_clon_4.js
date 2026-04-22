let collectiveBuffer = '';

const removeLeadingTrailingWhitespace = (textualSource) => {
    let start = 0;
    while (start < textualSource.length && (textualSource[start] === ' ' || textualSource[start] === '\n' || textualSource[start] === '\r' || textualSource[start] === '\t')) {
        start++;
    }
    let end = textualSource.length - 1;
    while (end >= 0 && (textualSource[end] === ' ' || textualSource[end] === '\n' || textualSource[end] === '\r' || textualSource[end] === '\t')) {
        end--;
    }
    if (start > end) {
        return '';
    }
    return textualSource.substring(start, end + 1);
};

const divideIntoLines = (fullText) => {
    const segments = [];
    let lastBoundary = 0;
    for (let charIndex = 0; charIndex < fullText.length; ++charIndex) {
        if (fullText[charIndex] === '\n') {
            segments[segments.length] = fullText.substring(lastBoundary, charIndex);
            lastBoundary = charIndex + 1;
        }
    }
    segments[segments.length] = fullText.substring(lastBoundary);
    return segments;
};

const segmentBySpace = (textString) => {
    const parts = [];
    let currentPart = '';
    for (let charIdx = 0; charIdx < textString.length; ++charIdx) {
        if (textString[charIdx] === ' ') {
            if (currentPart.length > 0) {
                parts[parts.length] = currentPart;
            }
            currentPart = '';
        } else {
            currentPart += textString[charIdx];
        }
    }
    if (currentPart.length > 0) {
        parts[parts.length] = currentPart;
    }
    return parts;
};

const appendElementToArray = (targetArray, itemToAdd) => {
    targetArray[targetArray.length] = itemToAdd;
};

const arrangeNumericAscending = (collection) => {
    const dataSize = collection.length;
    for (let outer = 0; outer < dataSize - 1; outer++) {
        for (let inner = 0; inner < dataSize - 1 - outer; inner++) {
            if (collection[inner] > collection[inner + 1]) {
                const temporary = collection[inner];
                collection[inner] = collection[inner + 1];
                collection[inner + 1] = temporary;
            }
        }
    }
};

const displayOutput = (valueToPresent) => {
    process.stdout.write(String(valueToPresent) + '\n');
};

function assessPairsExceedingSum(numericalData, limitValue) {
    arrangeNumericAscending(numericalData);

    let finalPairTotal = 0;
    let headPointer = 0;
    let tailPointer = numericalData.length - 1;

    while (headPointer < tailPointer) {
        if (numericalData[headPointer] + numericalData[tailPointer] > limitValue) {
            finalPairTotal += (tailPointer - headPointer);
            tailPointer--;
        } else {
            headPointer++;
        }
    }
    return finalPairTotal;
}

function initiateProcessing(completeSourceText) {
    const processedLines = removeLeadingTrailingWhitespace(completeSourceText);
    const dividedSections = divideIntoLines(processedLines);
    let lineCursor = 0;
    const computedResultsContainer = [];

    const processNextQuery = () => {
        if (lineCursor >= dividedSections.length) {
            return;
        }

        const currentLineComponents = segmentBySpace(dividedSections[lineCursor]);
        lineCursor++;

        const quantityOfElements = Number(currentLineComponents[0]);
        const sumBoundary = Number(currentLineComponents[1]);

        if (quantityOfElements === 0 && sumBoundary === 0) {
            for (let resultIdx = 0; resultIdx < computedResultsContainer.length; resultIdx++) {
                displayOutput(computedResultsContainer[resultIdx]);
            }
            return;
        }

        const valueItems = [];
        for (let itemCounter = 0; itemCounter < quantityOfElements; itemCounter++) {
            appendElementToArray(valueItems, Number(dividedSections[lineCursor]));
            lineCursor++;
        }

        const calculatedPairCount = assessPairsExceedingSum(valueItems, sumBoundary);
        appendElementToArray(computedResultsContainer, calculatedPairCount);

        processNextQuery();
    };

    processNextQuery();
}

process.stdin.on('data', (dataUnit) => {
    collectiveBuffer += String(dataUnit);
});

process.stdin.on('end', () => {
    initiateProcessing(collectiveBuffer);
});