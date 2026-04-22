'use strict';

const performOperation = () => {
    const fileAccessUtility = require('node:fs');
    const standardInputDescriptor = 0; // File descriptor for stdin
    const dataBlockCapacity = 1024 * 1024; // 1MB buffer for reading
    const dataStorageBuffer = Buffer.alloc(dataBlockCapacity);

    // Acquire data synchronously from the standard input stream
    const actualBytesRead = fileAccessUtility.readSync(standardInputDescriptor, dataStorageBuffer, 0, dataBlockCapacity);
    const entireDocumentContent = dataStorageBuffer.toString('utf8', 0, actualBytesRead);

    // Custom routine to segregate text by line breaks without relying on String.prototype.split
    function segmentByLine(sourceText) {
        const resultingSegments = [];
        let priorPosition = 0;
        let currentBreakPosition;
        while ((currentBreakPosition = sourceText.indexOf('\n', priorPosition)) !== -1) {
            resultingSegments.push(sourceText.substring(priorPosition, currentBreakPosition));
            priorPosition = currentBreakPosition + 1;
        }
        // Handle any remaining text after the last newline, or if no newlines were present
        if (priorPosition < sourceText.length) {
            resultingSegments.push(sourceText.substring(priorPosition));
        } else if (sourceText.endsWith('\n')) {
            // If the text concludes precisely with a newline, append an empty string
            // This mimics the behavior of `split('\n')` for trailing newlines
            resultingSegments.push('');
        }
        return resultingSegments;
    }

    const textualUnits = segmentByLine(entireDocumentContent);

    const initialTextualUnit = textualUnits[0];
    // Extract the first sequence of digits from the first textual unit
    const numericalMatch = initialTextualUnit.match(/^\d+/);
    // Convert the matched string to a numeric value. Default to 0 if no number is found.
    const numberOfEntriesToProcess = Number(numericalMatch ? numericalMatch[0] : '0');

    const lineSeparatorSymbol = '\n'; // Define a variable for the newline character

    // Traverse through the specified number of relevant textual units and output each twice
    for (let currentUnitIndex = 1; currentUnitIndex <= numberOfEntriesToProcess; ++currentUnitIndex) {
        const currentRelevantUnit = textualUnits[currentUnitIndex];
        process.stdout.write(currentRelevantUnit + lineSeparatorSymbol);
        process.stdout.write(currentRelevantUnit + lineSeparatorSymbol);
    }
};

// Initiate the primary execution flow
performOperation();