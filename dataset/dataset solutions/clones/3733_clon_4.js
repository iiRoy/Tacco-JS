(function() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Extract all sequences of digits from the input string.
    // This approach differs from splitting by newline and then by space.
    const numericalTokens = rawContent.match(/\d+/g);

    // Convert the extracted string tokens to numbers.
    // The first two numbers correspond to N and K.
    const primaryValue = Number(numericalTokens[0]); // Corresponds to N
    const secondaryValue = Number(numericalTokens[1]); // Corresponds to K

    // Calculate the adjusted numerator and denominator components.
    const adjustedNumerator = primaryValue - 1;
    const adjustedDenominator = secondaryValue - 1;

    let computedResult;

    // Implement the ceiling logic using an alternative mathematical form
    // or explicit handling for edge cases, instead of direct Math.ceil.
    if (adjustedDenominator === 0) {
        // This branch handles cases where K-1 is zero (i.e., K=1).
        // Preserves exact behavior of Math.ceil for division by zero:
        // (0/0) -> NaN, (positive/0) -> Infinity.
        computedResult = (adjustedNumerator === 0) ? Number.NaN : Number.POSITIVE_INFINITY;
    } else {
        // For positive denominators, Math.ceil(a / b) can be expressed as
        // Math.floor((a + b - 1) / b) for non-negative integer 'a' and positive integer 'b'.
        computedResult = Math.floor((adjustedNumerator + adjustedDenominator - 1) / adjustedDenominator);
    }

    console.log(computedResult);
})();
