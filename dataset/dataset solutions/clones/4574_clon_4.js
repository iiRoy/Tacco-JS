process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (rawInput) => {
    const parsedValues = String(rawInput).trim().split(/\s+/).map(Number);

    // Extract values from the parsed array.
    // If an element is missing, it will be `undefined`, which `Number()` converts to `NaN`.
    // If an element is non-numeric, `Number()` converts it to `NaN`.
    const lowerBound = parsedValues[0];
    const upperBound = parsedValues[1];
    const checkValue = parsedValues[2];

    // The comparison `checkValue >= lowerBound && checkValue <= upperBound`
    // inherently handles `NaN` and `undefined` (after `Number()` coercion to `NaN`)
    // by evaluating to `false` for any comparison involving `NaN`,
    // perfectly replicating the original's implicit type coercion behavior.
    const isWithinRange = (checkValue >= lowerBound && checkValue <= upperBound);

    console.log(isWithinRange ? "Yes" : "No");
});