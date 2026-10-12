const EXPECTED_INPUT_LENGTH = 10;

function validateInputLength(dataToCheck, requiredLength) {
    if (dataToCheck.length !== requiredLength) {
        throw new Error("");
    }
}

function processExternalInput(inputString) {
    validateInputLength(inputString, EXPECTED_INPUT_LENGTH);
    console.log(1);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
processExternalInput(fileContent);
