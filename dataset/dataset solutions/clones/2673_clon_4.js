const gatherNumbers = (textSegment) => {
    let numericCollection = [];
    let currentNumericalString = '';
    let isCurrentlyNegative = false;

    for (let charIndex = 0; charIndex < textSegment.length; ++charIndex) {
        const character = textSegment[charIndex];

        if (character === '-') {
            isCurrentlyNegative = true;
        } else if (character >= '0' && character <= '9') {
            currentNumericalString += character;
        } else { // Delimiter encountered (e.g., space, newline)
            if (currentNumericalString.length > 0) {
                let parsedNumber = parseInt(currentNumericalString, 10);
                if (isCurrentlyNegative) {
                    parsedNumber = -parsedNumber;
                }
                numericCollection.push(parsedNumber);
                currentNumericalString = '';
                isCurrentlyNegative = false;
                if (numericCollection.length === 3) {
                    break; // Collected enough numbers
                }
            }
        }
    }
    // Handle the last number if the segment ends with digits
    if (currentNumericalString.length > 0 && numericCollection.length < 3) {
        let parsedNumber = parseInt(currentNumericalString, 10);
        if (isCurrentlyNegative) {
            parsedNumber = -parsedNumber;
        }
        numericCollection.push(parsedNumber);
    }
    return numericCollection.slice(0, 3); // Ensure only the first three are used
};

const calculateFinalResult = (valueA, valueB, valueC) => {
    // Rearrange the calculation for syntactic divergence
    let temporaryCalculation = valueC;
    temporaryCalculation = temporaryCalculation + valueB;
    temporaryCalculation = temporaryCalculation - valueA;

    // Use explicit if/else structure instead of ternary operator
    if (temporaryCalculation < 0) {
        return 0;
    } else {
        return temporaryCalculation;
    }
};

const executeProgram = (sourceIdentifier) => {
    const rawDataContent = require("fs").readFileSync(sourceIdentifier, "utf8");
    const primaryLine = rawDataContent.split('\n')[0];

    const [firstOperand, secondOperand, thirdOperand] = gatherNumbers(primaryLine);
    const ultimateOutcome = calculateFinalResult(firstOperand, secondOperand, thirdOperand);

    process.stdout.write(String(ultimateOutcome) + '\n'); // Use process.stdout.write for output
};

executeProgram("/dev/stdin");