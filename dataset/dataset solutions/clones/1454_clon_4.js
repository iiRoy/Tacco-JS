let collectedData = '';

process.stdin.on('data', fragment => {
    collectedData += fragment.toString();
});

process.stdin.on('end', () => {
    function retrieveTargetLine(sourceContent, lineNumber) { // lineNumber is 0-indexed
        let currentLinePosition = 0;
        let lineStartBoundary = 0;
        for (let characterIndex = 0; characterIndex < sourceContent.length; ++characterIndex) {
            if (sourceContent[characterIndex] === '\n') {
                if (currentLinePosition === lineNumber) {
                    return sourceContent.substring(lineStartBoundary, characterIndex);
                }
                currentLinePosition++;
                lineStartBoundary = characterIndex + 1;
            }
        }
        // Handle case where file doesn't end with newline or target is the last line
        if (currentLinePosition === lineNumber) {
            return sourceContent.substring(lineStartBoundary);
        }
        return undefined; // Line not found
    }

    const relevantLine = retrieveTargetLine(collectedData, 1); // Get the second line (index 1)

    if (typeof relevantLine === 'undefined') {
        // Replicate original error if arr[1] is undefined, which would cause .split() to fail
        throw new Error("Input data missing required line.");
    }

    function extractNumericalValues(textSegment) {
        if (typeof textSegment !== 'string') {
            throw new Error("Invalid segment for numerical parsing.");
        }
        const parsedFigures = [];
        let segmentStartPoint = 0;

        for (let charPointer = 0; charPointer < textSegment.length; ++charPointer) {
            if (textSegment[charPointer] === ' ' || textSegment[charPointer] === '\t') {
                // When a space or tab is found, the substring from segmentStartPoint to charPointer is a segment
                parsedFigures.push(Number(textSegment.substring(segmentStartPoint, charPointer)));
                segmentStartPoint = charPointer + 1; // Move starting point for next segment
            }
        }
        // After the loop, add the last segment (from segmentStartPoint to end of string)
        parsedFigures.push(Number(textSegment.substring(segmentStartPoint)));

        return parsedFigures;
    }

    const numericalCollection = extractNumericalValues(relevantLine);

    function performInsertionSort(itemsCollection) {
        const totalItems = itemsCollection.length;
        for (let primaryIterator = 1; primaryIterator < totalItems; primaryIterator++) {
            let itemToPlace = itemsCollection[primaryIterator];
            let secondaryIterator = primaryIterator - 1;
            while (secondaryIterator >= 0 && itemsCollection[secondaryIterator] > itemToPlace) {
                itemsCollection[secondaryIterator + 1] = itemsCollection[secondaryIterator];
                secondaryIterator--;
            }
            itemsCollection[secondaryIterator + 1] = itemToPlace;
        }
        return itemsCollection;
    }

    const finalOrderedNumbers = performInsertionSort(numericalCollection);

    let resultString = '';
    for (let outputIterator = 0; outputIterator < finalOrderedNumbers.length; ++outputIterator) {
        resultString += finalOrderedNumbers[outputIterator].toString();
        if (outputIterator < finalOrderedNumbers.length - 1) {
            resultString += ' ';
        }
    }
    process.stdout.write(resultString + '\n');
});