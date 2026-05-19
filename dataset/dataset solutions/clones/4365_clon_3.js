function processDataStream(rawInputString) {
    const inputLines = rawInputString.split('\n');

    // Remove the first line, which is often metadata in such problems.
    inputLines.shift();

    // Define a small helper function to parse a single line of space-separated integers.
    const parseNumericPair = (lineContent) => {
        return lineContent.split(' ').map(strValue => parseInt(strValue, 10));
    };

    // Transform the remaining input lines into an array of number pairs.
    const numericPairs = inputLines.map(parseNumericPair);

    // Initialize an accumulator for the total sum.
    let cumulativeSum = 0;

    // Iterate through each pair to calculate and add the range length to the sum.
    // Using a for...of loop for a slightly different iteration style than the original for loop.
    for (const currentPair of numericPairs) {
        const lowerBound = currentPair[0];
        const upperBound = currentPair[1];
        const segmentLength = upperBound - lowerBound + 1;
        cumulativeSum += segmentLength;
    }

    // Output the final calculated sum using the specified format.
    console.log('%d', cumulativeSum);
}

// Read the entire content of standard input and pass it to the processing function.
processDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
