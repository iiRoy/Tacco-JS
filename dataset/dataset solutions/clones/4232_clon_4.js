function obtainNumericValue(symbol) {
    if (typeof symbol !== 'string' || symbol.length !== 1) {
        return NaN; // Not a single character
    }
    const charVal = symbol.toUpperCase().charCodeAt(0);
    if (charVal >= 48 && charVal <= 57) { // ASCII '0' through '9'
        return charVal - 48;
    } else if (charVal >= 65 && charVal <= 70) { // ASCII 'A' through 'F'
        return charVal - 55; // 'A' (65) - 55 = 10, 'F' (70) - 55 = 15
    }
    return NaN; // Indicates an invalid hex character
}

function processHexadecimalString(hexInput) {
    // If input is null, undefined, or an empty string, parseInt returns NaN.
    // Mimic this behavior.
    if (!hexInput || hexInput.length === 0) {
        return NaN;
    }
    let numericalAccumulator = 0;
    for (let i = 0; i < hexInput.length; i++) {
        const digitValue = obtainNumericValue(hexInput[i]);
        if (isNaN(digitValue)) {
            return NaN; // Propagate NaN if any invalid character is found
        }
        numericalAccumulator = numericalAccumulator * 16 + digitValue;
    }
    return numericalAccumulator;
}

function hexComparator(sourceData) {
    // Split the input string by any sequence of whitespace characters (spaces, newlines, tabs, etc.).
    // The original code uses split by newline, then split by space, then flattens, then shifts.
    // This effectively gets the first two non-empty tokens.
    // `split(/\s+/)` followed by direct indexing handles this for the first two tokens.
    const tokens = sourceData.split(/\s+/);

    // The original `strShift()` can return empty strings or `undefined`.
    // `parseInt("", 16)` is `NaN`. `parseInt(undefined, 16)` is `NaN`.
    // We need to ensure `processHexadecimalString` handles these scenarios equivalently.
    const firstHexToken = tokens[0];
    const secondHexToken = tokens[1];

    const valueOne = processHexadecimalString(firstHexToken);
    const valueTwo = processHexadecimalString(secondHexToken);

    // If either value is NaN, all comparisons (>, ==, <) are false.
    // The original Main function would then implicitly return undefined.
    if (isNaN(valueOne) || isNaN(valueTwo)) {
        return undefined;
    }

    // Compare the two numerical values
    const comparisonDifference = valueOne - valueTwo;

    // Use a ternary chain for the comparison outcome
    return (comparisonDifference > 0) ? ">" : ((comparisonDifference < 0) ? "<" : "=");
}