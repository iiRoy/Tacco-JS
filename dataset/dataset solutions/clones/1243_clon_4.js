const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

// Custom function to perform floor division (rounds towards negative infinity)
const computeIntegralPart = (dividendValue, divisorValue) => {
    const calculationResult = dividendValue / divisorValue;
    // Math.trunc rounds towards zero. To mimic Math.floor behavior for negative numbers
    if (calculationResult < 0 && calculationResult % 1 !== 0) {
        return Math.trunc(calculationResult) - 1;
    }
    return Math.trunc(calculationResult);
};

// Custom function to format a number to a fixed number of decimal places
const formatDecimalPrecision = (numericValue, decimalPlaces) => {
    if (isNaN(numericValue)) return "NaN";

    const powerOfTen = Math.pow(10, decimalPlaces);
    const scaledNumeric = numericValue * powerOfTen;
    const roundedNumeric = Math.round(scaledNumeric);
    let resultAsString = (roundedNumeric / powerOfTen).toString();

    // Ensure correct decimal padding
    let [integerSegment, fractionalSegment = ''] = resultAsString.split('.');

    if (fractionalSegment.length < decimalPlaces) {
        fractionalSegment += '0'.repeat(decimalPlaces - fractionalSegment.length);
    } else if (fractionalSegment.length > decimalPlaces) {
        fractionalSegment = fractionalSegment.substring(0, decimalPlaces);
    }

    if (decimalPlaces === 0) {
        return integerSegment;
    } else {
        return `${integerSegment}.${fractionalSegment}`;
    }
};

// Main processing logic for each input line
const processInputLineData = (incomingTextLine) => {
    const cleanedText = incomingTextLine.trim();
    const numberPattern = /^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/;
    const numericMatches = cleanedText.match(numberPattern);

    // Assume valid input as per original code's implied behavior (would produce NaN or error otherwise)
    const firstOperand = parseFloat(numericMatches[1]);
    const secondOperand = parseFloat(numericMatches[3]);

    const integralOutcome = computeIntegralPart(firstOperand, secondOperand);
    const remainderOutcome = firstOperand - integralOutcome * secondOperand;
    const preciseOutcome = formatDecimalPrecision(firstOperand / secondOperand, 5);

    return `${integralOutcome} ${remainderOutcome} ${preciseOutcome}`;
};

// Event listener for each line of input
inputProcessor.on('line', (currentLine) => {
    const finalOutputText = processInputLineData(currentLine);
    process.stdout.write(finalOutputText + '\n');
});