const calculateDigitSum = (numericInput) => {
    const stringRepresentation = String(numericInput);
    const digitCharacters = Array.from(stringRepresentation);
    const sumOfDigits = digitCharacters.reduce((accumulator, currentDigitChar) => {
        return accumulator + Number(currentDigitChar);
    }, 0);
    return sumOfDigits;
};

function processNumericInput(rawInputContent) {
    let maximumDigitSum = 0;

    // This structure precisely replicates the behavior of `for(i=input;i--;)`
    // The loop variable `i` inside the original loop body takes values:
    // Number(input) - 1, Number(input) - 2, ..., 0.
    // If Number(input) is 0, the loop does not run.
    // If Number(input) is negative, the loop runs infinitely.
    // If Number(input) is NaN, the loop does not run.

    let loopIterationValue = Number(rawInputContent); // This variable will be decremented

    while (true) {
        const valueForConditionCheck = loopIterationValue; // Store value *before* decrement for truthiness check
        loopIterationValue--; // Decrement for the next iteration

        if (!valueForConditionCheck) { // If the value *before* decrement was falsy (0, NaN, etc.)
            break; // Exit the loop
        }

        // The value used for calculation inside the loop body is the *decremented* value.
        const currentNumberForSum = loopIterationValue;

        const currentNumberDigitSum = calculateDigitSum(currentNumberForSum);
        maximumDigitSum = Math.max(maximumDigitSum, currentNumberDigitSum);
    }

    console.log(maximumDigitSum);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const inputDataString = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

processNumericInput(inputDataString);
