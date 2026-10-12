const fileSystemInterface = require('fs');

const rawDataFromInput = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const firstToken = rawDataFromInput.trim().split(/\s+/g)[0];

const numericalInput = Number.parseInt(firstToken, 10);

const digitSequencePattern = /(.)\1{2,}/;

const inputAsString = String(numericalInput);

const hasRepeatingDigits = digitSequencePattern.test(inputAsString);

if (hasRepeatingDigits) {
    console.log("Yes");
} else {
    console.log("No");
}

module.exports = undefined;
