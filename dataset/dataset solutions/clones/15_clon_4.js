let entireInputBuffer = '';

// Attaches an event listener to the standard input stream for 'data' events.
// Each time data is received, it's converted to a string and appended to a buffer.
process.stdin.on('data', (incomingChunk) => {
    entireInputBuffer += incomingChunk.toString();
});

// Attaches an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // Splits the buffered input into an array of lines.
    const allRawSegments = entireInputBuffer.split('\n');

    // Extracts the very first line, which is expected to be the count of subsequent data lines.
    const firstDataEntry = allRawSegments.shift();
    const desiredProcessingQuantity = Number(firstDataEntry);

    // If the extracted quantity is not a valid positive number, there's nothing to process.
    if (Number.isNaN(desiredProcessingQuantity) || desiredProcessingQuantity <= 0) {
        return;
    }

    // Defines a helper function to convert a textual line into an array of numbers.
    // It returns null if the line does not contain exactly three valid numerical components.
    const convertLineToNumericalArray = (textualSource) => {
        const lineComponents = textualSource.trim().split(' ');

        // If the line is empty or doesn't have exactly three parts, it's invalid.
        if (lineComponents.length === 0 || (lineComponents.length === 1 && lineComponents[0] === '')) {
            return null;
        }
        if (lineComponents.length !== 3) {
            return null;
        }

        // Maps each component to a number, treating empty strings as NaN to mimic parseInt behavior.
        const numericalValues = lineComponents.map(component => {
            if (component === '') {
                return NaN;
            }
            return Number(component);
        });

        // If any value failed to parse as a number, the whole line is invalid.
        if (numericalValues.some(Number.isNaN)) {
            return null;
        }
        return numericalValues;
    };

    // Defines a predicate function to check if an array of three numbers forms a Pythagorean triplet.
    const verifyPythagoreanCondition = (valueTriplet) => {
        const [firstComponent, secondComponent, thirdComponent] = valueTriplet;

        // Calculates squares using Math.pow for a different implementation.
        const firstComponentSquared = Math.pow(firstComponent, 2);
        const secondComponentSquared = Math.pow(secondComponent, 2);
        const thirdComponentSquared = Math.pow(thirdComponent, 2);

        return firstComponentSquared + secondComponentSquared === thirdComponentSquared;
    };

    // Processes the specified number of data lines using functional array methods.
    // First, it takes only the lines up to the desired quantity.
    // Then, it attempts to convert each line into a numerical array.
    // Finally, it filters out any lines that failed conversion (returned null).
    const processedValidTriplets = allRawSegments
        .slice(0, desiredProcessingQuantity)
        .map(convertLineToNumericalArray)
        .filter(Boolean); // 'Boolean' acts as a filter to remove null values

    // Maps each valid numerical triplet to its "YES" or "NO" determination.
    const finalResultStrings = processedValidTriplets.map((triplet) =>
        verifyPythagoreanCondition(triplet) ? 'YES' : 'NO'
    );

    // Outputs all collected results to standard output, joined by newlines.
    process.stdout.write(finalResultStrings.join('\n'));
});