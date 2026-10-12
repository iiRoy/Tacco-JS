function processInput(rawData) {
    const parsedValues = rawData.split(' ');

    const baseForPower = 100;

    // Helper function to replicate the behavior of `>> 0` for string to integer conversion.
    // This handles non-numeric strings by converting them to 0, and truncates floats.
    const getTruncatedInteger = (inputString) => {
        const numericRepresentation = Number(inputString);
        // If the conversion results in NaN (e.g., for "abc"), the original `>> 0` would yield 0.
        // Otherwise, it truncates the number to an integer.
        return isNaN(numericRepresentation) ? 0 : Math.trunc(numericRepresentation);
    };

    // Extract and parse the exponent value using the helper function
    const exponentString = parsedValues[0];
    const exponentValue = getTruncatedInteger(exponentString);

    // Extract and parse the multiplier value using the helper function
    const multiplierString = parsedValues[1];
    const multiplierValue = getTruncatedInteger(multiplierString);

    // Calculate the power of the base
    const powerCalculationResult = Math.pow(baseForPower, exponentValue);

    // Calculate the final product
    const finalComputedResult = powerCalculationResult * multiplierValue;

    console.log(finalComputedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
