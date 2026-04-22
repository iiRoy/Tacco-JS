function processData(rawData) {
    // Convert the raw input string to a numerical value.
    // This approach directly casts the trimmed string to a number.
    const numericValue = Number(rawData.trim());

    // Define the exponents for the power calculation.
    // This represents the terms: value^1, value^2, value^3.
    const powerIndices = [1, 2, 3];

    // Calculate each term by raising the numeric value to the corresponding power.
    // Uses a functional map operation to transform the power indices into actual terms.
    const calculatedTerms = powerIndices.map(currentExponent => {
        return Math.pow(numericValue, currentExponent);
    });

    // Sum all the calculated terms to get the final result.
    // Uses a functional reduce operation for aggregation.
    const finalSum = calculatedTerms.reduce((aggregate, term) => {
        return aggregate + term;
    }, 0); // Start the aggregation with an initial sum of zero.

    // Print the final computed value to the console.
    console.log(finalSum);
}

// This section handles standard input/output and should not be modified.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));