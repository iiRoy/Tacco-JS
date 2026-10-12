const fileSystem = require('fs');

function calculateCharacterMetrics(lineContent) {
    const characterArray = lineContent.split('');

    // Step 1: Pre-process to find all 'c' character positions
    const cIndices = characterArray.reduce((indicesAccumulator, charUnit, charPosition) => {
        if (charUnit === 'c') {
            indicesAccumulator.push(charPosition);
        }
        return indicesAccumulator;
    }, []);

    // Step 2: Map each character to its corresponding metric
    return characterArray.map((charUnit, charPosition) => {
        if (charUnit === 'c') {
            return 0; // 'c' characters always have a metric of 0
        } else { // Character is '.'
            // Find all 'c's that appeared at or before the current character's position
            const precedingCLocations = cIndices.filter(cLoc => cLoc <= charPosition);

            // Determine the index of the 'c' closest to the left (or at the current position)
            const lastPrecedingC = precedingCLocations.length > 0
                ? precedingCLocations[precedingCLocations.length - 1]
                : undefined;

            if (lastPrecedingC === undefined) {
                return -1; // No 'c' found to the left or at this position
            } else {
                // Calculate the distance from the current position to the last 'c'
                return charPosition - lastPrecedingC;
            }
        }
    });
}

const rawFileContents = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawFileContents.trim().split('\n');

// The first line is extracted but its value is not used in the observable behavior.
const initialLineData = processedLines.shift();

// Apply the metric calculation to each remaining line
const computedMetricsCollection = processedLines.map(calculateCharacterMetrics);

// Format the final output: join numbers in each row with spaces, then join rows with newlines
console.log(computedMetricsCollection.map(rowOfMetrics => rowOfMetrics.join(' ')).join('\n'));
