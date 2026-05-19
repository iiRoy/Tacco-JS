const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const trimmedInputContent = rawInputData.trim();
const inputLinesArray = trimmedInputContent.split("\n");

const romanNumeralChars = "I,V,X,L,C,D,M".split(",");
const numeralValues = [1, 5, 10, 50, 100, 500, 1000];

const charToValueMap = new Map();
romanNumeralChars.forEach((charSymbol, idx) => {
    charToValueMap.set(charSymbol, numeralValues[idx]);
});

function retrieveRomanCharValue(char) {
    return charToValueMap.get(char);
}

const INITIAL_PREVIOUS_VALUE_RESET = 1000;

inputLinesArray.forEach((currentRomanString) => {
    const romanCharsInString = currentRomanString.split("");
    let calculatedTotal = 0;
    let previousCharValue = INITIAL_PREVIOUS_VALUE_RESET;

    romanCharsInString.forEach((singleChar) => {
        const currentCharNumericValue = retrieveRomanCharValue(singleChar);
        let effectiveValueForAddition = currentCharNumericValue;

        if (previousCharValue < currentCharNumericValue) {
            const doublePrevious = 2 * previousCharValue;
            effectiveValueForAddition = currentCharNumericValue - doublePrevious;
            previousCharValue = INITIAL_PREVIOUS_VALUE_RESET;
        } else {
            previousCharValue = currentCharNumericValue;
        }
        calculatedTotal += effectiveValueForAddition;
    });
    console.log(calculatedTotal);
});
