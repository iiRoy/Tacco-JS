stdInputSource.resume();
stdInputSource.setEncoding('utf8');

const processIncomingData = function(rawDataBuffer) {
    const parseNumericString = (str) => {
        const parsed = parseInt(str.trim(), 10);
        return isNaN(parsed) ? null : parsed;
    };

    const rawInputLines = rawDataBuffer.trim().split("\n");
    let currentLineIndex = 0;

    while (currentLineIndex < rawInputLines.length) {
        const lineWithElementCount = rawInputLines[currentLineIndex];
        currentLineIndex++; // Advance line index for the next iteration

        if (!lineWithElementCount || lineWithElementCount.trim() === '') {
            // Skip empty lines, but don't treat them as termination.
            continue;
        }

        const expectedElementCount = parseNumericString(lineWithElementCount);

        if (expectedElementCount === null) {
            console.error(`Skipping malformed element count line: "${lineWithElementCount}"`);
            continue;
        }
        if (expectedElementCount === 0) {
            // A zero indicates the end of input for this problem type.
            break;
        }

        const sequenceLine = rawInputLines[currentLineIndex];
        currentLineIndex++; // Advance line index for the next iteration

        if (!sequenceLine) {
            console.error("Error: Expected sequence line, but found none. Terminating.");
            break;
        }

        const sequenceElementsAsStrings = sequenceLine.trim().split(" ").filter(s => s !== '');

        if (sequenceElementsAsStrings.length < 2) {
            console.error(`Skipping sequence due to insufficient elements (expected at least 2, got ${sequenceElementsAsStrings.length}): "${sequenceLine}"`);
            continue;
        }
        
        const computedDifferences = new Array(sequenceElementsAsStrings.length).fill(null);

        let firstNumericVal = parseNumericString(sequenceElementsAsStrings[0]);
        let secondNumericVal = parseNumericString(sequenceElementsAsStrings[1]);

        if (firstNumericVal === null || secondNumericVal === null) {
            console.error(`Skipping sequence due to invalid initial numbers: "${sequenceElementsAsStrings[0]}", "${sequenceElementsAsStrings[1]}"`);
            continue;
        }

        computedDifferences[1] = secondNumericVal - firstNumericVal;

        let anomalyCount = 0;
        let firstAnomalyIndex = 0;

        let previousNumericValue = secondNumericVal;
        let currentNumericValue;

        for (let sequenceIterator = 2; sequenceIterator < sequenceElementsAsStrings.length; ++sequenceIterator) {
            currentNumericValue = parseNumericString(sequenceElementsAsStrings[sequenceIterator]);

            if (currentNumericValue === null) {
                console.error(`Warning: Invalid number at index ${sequenceIterator} in sequence, skipping difference calculation for this step.`);
                // Effectively "skip" this element for difference calculation.
                // The previousNumericValue remains as it was, and this element is not considered.
                continue;
            }
            if (previousNumericValue === null) {
                 // If previous was invalid, we can't compute a meaningful difference.
                 // This might happen if a prior element was malformed.
                 previousNumericValue = currentNumericValue;
                 continue;
            }

            const currentDelta = currentNumericValue - previousNumericValue;
            computedDifferences[sequenceIterator] = currentDelta;

            const priorDelta = computedDifferences[sequenceIterator - 1];

            if (currentDelta !== priorDelta) {
                firstAnomalyIndex = sequenceIterator;
                anomalyCount++;
            }

            previousNumericValue = currentNumericValue;

            if (anomalyCount === 3) {
                process.stdout.write(sequenceElementsAsStrings[firstAnomalyIndex - 2] + '\n');
                return;
            }
            else if (anomalyCount === 1 && (sequenceIterator - firstAnomalyIndex) > 1) {
                process.stdout.write(sequenceElementsAsStrings[firstAnomalyIndex - 2] + '\n');
                return;
            }
        }
        
        process.stdout.write(sequenceElementsAsStrings[firstAnomalyIndex] + '\n');
    }
};

stdInputSource.on('data', processIncomingData);