(function() {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Extract numeric sequences from the input string, allowing for negative numbers,
    // and convert them to actual number types.
    const numericDataPoints = rawData.match(/-?\d+/g).map(Number);

    // Assign the extracted values to distinct variables for clarity and to avoid original identifiers.
    const primaryValue = numericDataPoints[0];
    const secondaryValue = numericDataPoints[1];

    // Define the constant divisor.
    const modulusBase = 500;

    // Calculate the remainder of the primary value divided by the modulusBase,
    // replicating the behavior of JavaScript's '%' operator (remainder, not true mathematical modulo)
    // using Math.trunc for correct handling of negative numbers.
    const calculatedRemainder = primaryValue - modulusBase * Math.trunc(primaryValue / modulusBase);

    // Determine the final outcome based on the comparison, using a ternary operator
    // instead of an if-else block.
    const finalDecision = (calculatedRemainder <= secondaryValue) ? 'Yes' : 'No';

    // Output the result using a different method than console.log.
    process.stdout.write(finalDecision + '\n');
})();