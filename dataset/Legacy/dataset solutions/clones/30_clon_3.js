var fileSystemModule = require("fs");

const INITIAL_BASE_LOAN_VALUE = 100;
const ANNUAL_GROWTH_FACTOR = 1.05;
const FINAL_SCALE_FACTOR = 1000;

function calculateLoanAmount(numYears) {
    let currentLoanValue = INITIAL_BASE_LOAN_VALUE;
    for (let yearIndex = 0; yearIndex < numYears; yearIndex++) {
        let nextPeriodRawValue = currentLoanValue * ANNUAL_GROWTH_FACTOR;
        currentLoanValue = Math.ceil(nextPeriodRawValue);
    }
    return currentLoanValue * FINAL_SCALE_FACTOR;
}

let fileContentBuffer = fileSystemModule.readFileSync('/dev/stdin');
let trimmedStringInput = fileContentBuffer.toString().trim();
let parsedNumericInput = parseInt(trimmedStringInput, 10);

console.log(calculateLoanAmount(parsedNumericInput));
