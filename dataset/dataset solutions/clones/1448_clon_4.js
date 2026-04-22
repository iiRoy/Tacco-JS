const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const textRows = dataStream.split('\n');

function processDataSet(rowIdentifier, allTextualLines) {
    if (rowIdentifier >= allTextualLines.length) {
        return; // Reached the end of the input lines
    }

    const rawInputLine = allTextualLines[rowIdentifier];
    if (rawInputLine === undefined) {
        return; // Defensive check for unexpected end of array
    }

    // Convert the line to a number, mimicking the original's `+lines.shift()` behavior
    // which converts empty strings (from empty lines) to 0.
    const valueCount = +rawInputLine;

    // Termination condition for the problem's logic
    if (valueCount === 0) {
        return;
    }

    // Ensure there's a subsequent line for the data points
    const numberSequenceLine = allTextualLines[rowIdentifier + 1];
    if (numberSequenceLine === undefined) {
        // This indicates malformed input if valueCount > 0 but no data line follows
        return;
    }

    // Parse the numbers using the Number constructor for type conversion
    const numericalCollection = numberSequenceLine.split(' ').map(Number);

    let summationOfValues = 0;
    let summationOfSquaredValues = 0;

    // Compute both the sum and sum of squares in a single pass
    for (let i = 0; i < numericalCollection.length; i++) {
        const individualValue = numericalCollection[i];
        summationOfValues += individualValue;
        summationOfSquaredValues += (individualValue * individualValue);
    }

    const elementsQuantity = numericalCollection.length;
    // Calculate the arithmetic mean (average)
    const arithmeticMean = summationOfValues / elementsQuantity;

    // Use the alternative formula for variance: E[X^2] - (E[X])^2
    // where E[X^2] is the mean of the squared values
    const expectedValueSquared = summationOfSquaredValues / elementsQuantity;
    // And (E[X])^2 is the square of the mean
    const meanSquared = arithmeticMean * arithmeticMean;
    const varianceResult = expectedValueSquared - meanSquared;

    // The standard deviation is the square root of the variance
    const finalDeviation = Math.sqrt(varianceResult);

    // Output the result formatted to 5 decimal places
    process.stdout.write(finalDeviation.toFixed(5) + '\n');

    // Recursively call for the next data block. Each block consumes two lines.
    processDataSet(rowIdentifier + 2, allTextualLines);
}

// Begin processing from the very first line of the input
processDataSet(0, textRows);