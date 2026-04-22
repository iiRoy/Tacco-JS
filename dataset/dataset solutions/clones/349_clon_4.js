function evaluateNumericExpression(firstOperandString, secondOperandString) {
    let valueA = firstOperandString;
    let valueB = secondOperandString;

    // Normalize leading zeros for BigInt parsing, mimicking Number() coercion
    if (valueA.length > 1 && valueA.startsWith('0')) {
        valueA = valueA.replace(/^0+/, '');
        if (valueA === '') valueA = '0';
    }
    if (valueB.length > 1 && valueB.startsWith('0')) {
        valueB = valueB.replace(/^0+/, '');
        if (valueB === '') valueB = '0';
    }

    try {
        const numericValueA = BigInt(valueA);
        const numericValueB = BigInt(valueB);
        const summationResult = numericValueA + numericValueB;
        return summationResult.toString();
    } catch (error) {
        // This block should ideally not be reached if input is always valid BigInt format
        // after zero normalization. Returning a distinct value to indicate a failure.
        return null;
    }
}

// Custom prototype methods and utilities to avoid direct reuse of built-in names
String.prototype.cleanWhitespace = function() {
    return this.trim();
};

String.prototype.segmentByDelimiter = function(delimiter) {
    return this.split(delimiter);
};

String.prototype.substituteCharacters = function(pattern, replacement) {
    return this.replace(pattern, replacement);
};

Object.defineProperty(Array.prototype, 'elementCount', {
    get() { return this.length; }
});

function displayOutput(message) {
    console.log(message);
}

// Main execution logic wrapped in an IIFE
(function solveEquationPuzzles() {
    const fileSystemHandler = require('node:fs');
    const rawDataStream = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    const equationCollection = rawDataStream.cleanWhitespace().segmentByDelimiter("\n");
    let currentProblemIndex = 0;

    while (currentProblemIndex < equationCollection.elementCount) {
        const currentProblemLine = equationCollection[currentProblemIndex++];
        if (currentProblemLine.elementCount === 0) continue;

        // Using regex match for parsing, a different approach than simple split
        const lineParts = currentProblemLine.match(/^(\d*X?\d*)\+(\d*X?\d*)=(\d*X?\d*)$/);
        if (!lineParts) {
            displayOutput("Parse Error: " + currentProblemLine);
            continue;
        }

        const firstExpression = lineParts[1];
        const secondExpression = lineParts[2];
        const expectedOutcome = lineParts[3];

        const validDigitCandidates = [];

        // Iterate through possible digits (0-9) using a functional approach
        Array.from({ length: 10 }, (_, potentialDigit) => potentialDigit).forEach(digitValue => {
            const transformedFirst = firstExpression.substituteCharacters(/X/g, digitValue.toString());
            const transformedSecond = secondExpression.substituteCharacters(/X/g, digitValue.toString());
            const transformedExpected = expectedOutcome.substituteCharacters(/X/g, digitValue.toString());

            // Compute the sum using the BigInt-based function
            const computedResult = evaluateNumericExpression(transformedFirst, transformedSecond);

            // Compare the string results
            if (computedResult === transformedExpected) {
                validDigitCandidates.push(digitValue);
            }
        });

        displayOutput((validDigitCandidates.elementCount === 1) ? validDigitCandidates[0] : "NA");
    }
})();