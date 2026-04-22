process.stdin.resume();

process.stdin.setEncoding('utf8');

const displayResult = console.log;

let accumulatedInputBuffer = '';

process.stdin.on('data', function handleIncomingData(inputDataSegment) {
    accumulatedInputBuffer += inputDataSegment;
});

process.stdin.on('end', () => {
    if (!accumulatedInputBuffer.trim()) {
        displayResult("No input data was provided for processing. The program will now exit.");
        return;
    }
    processInputChunk(accumulatedInputBuffer);
});

/**
 * Orchestrates the initial parsing of raw input data into meaningful string lines.
 * This function is responsible for cleaning up the input before numerical processing.
 * @param {string} rawInputString - The full string received from the standard input.
 */
function processInputChunk(rawInputString) {
    let processedStringLines = rawInputString.split(/\r?\n/);

    processedStringLines = processedStringLines.filter(currentLineText => currentLineText.trim() !== '');

    if (processedStringLines.length === 0) {
        displayResult("Input contained only empty or whitespace-only lines. No numerical operations can be performed.");
        return;
    }

    executeCoreLogic(processedStringLines);
}

/**
 * Implements the primary numerical analysis workflow. It processes a sequence of numbers
 * in defined segments, discards extreme values, and computes averaged results.
 * @param {string[]} numericStringArray - An array of strings, each expected to be a numeric value.
 */
function executeCoreLogic(numericStringArray) {
    let workingNumericSequence = numericStringArray
        .map(numericStringElement => {
            const parsedNumericalValue = Number(numericStringElement);
            return !isNaN(parsedNumericalValue) ? parsedNumericalValue : null;
        })
        .filter(val => val !== null);

    if (workingNumericSequence.length < 2) {
        displayResult("Insufficient valid numeric data to proceed. Need at least two numbers to form segments.");
        return;
    }

    while (workingNumericSequence.length > 1) {
        const segmentSizeIndicator = workingNumericSequence.shift();

        if (typeof segmentSizeIndicator !== 'number' || !Number.isInteger(segmentSizeIndicator) || segmentSizeIndicator <= 0) {
            displayResult(`Warning: Encountered an invalid segment size indicator (${segmentSizeIndicator}). Skipping this iteration.`);
            continue;
        }

        if (workingNumericSequence.length < segmentSizeIndicator) {
            displayResult(`Notice: Remaining data (${workingNumericSequence.length} elements) is less than the requested segment size (${segmentSizeIndicator}). Terminating processing.`);
            break;
        }

        let currentSegmentForAnalysis = workingNumericSequence.slice(0, segmentSizeIndicator);
        workingNumericSequence.splice(0, segmentSizeIndicator);

        if (currentSegmentForAnalysis.length < 3) {
            displayResult(`Info: Segment of size ${currentSegmentForAnalysis.length} is too small to remove min/max and compute a meaningful average. Skipping.`);
            continue;
        }

        const minimumValueInSegment = Math.min(...currentSegmentForAnalysis);
        const minIndex = currentSegmentForAnalysis.indexOf(minimumValueInSegment);
        if (minIndex > -1) {
            currentSegmentForAnalysis.splice(minIndex, 1);
        } else {
            displayResult("Error: Minimum value not located in segment after determination. This indicates an internal inconsistency.");
            continue;
        }

        const maximumValueInSegment = Math.max(...currentSegmentForAnalysis);
        const maxIndex = currentSegmentForAnalysis.indexOf(maximumValueInSegment);
        if (maxIndex > -1) {
            currentSegmentForAnalysis.splice(maxIndex, 1);
        } else {
            displayResult("Error: Maximum value not located in segment after determination. This indicates an internal inconsistency.");
            continue;
        }

        if (currentSegmentForAnalysis.length === 0) {
            displayResult("Warning: Segment became empty after removing minimum and maximum values. Cannot compute an average.");
            continue;
        }

        const segmentTotal = currentSegmentForAnalysis.reduce((previousAccumulator, currentElement) => previousAccumulator + currentElement, 0);
        const calculatedAverage = segmentTotal / currentSegmentForAnalysis.length;
        const finalFlooredResult = Math.floor(calculatedAverage);

        displayResult(finalFlooredResult);
    }
}