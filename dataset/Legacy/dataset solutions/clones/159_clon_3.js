const ROMAN_NUMERAL_SYMBOLS = ".IVXLCDM"; 
let currentCharacterIndex = 0; 
let currentLineAccumulatedSum = 0; 
let previousCharacterNumericValue = 0; 
let currentCharacterNumericValue = 0; 

const fileSystemOperations = require("fs");
const inputDataString = fileSystemOperations.readFileSync("/dev/stdin", "utf8");

function calculateRomanCharValue(romanChar, symbolMap) {
    const symbolIndex = symbolMap.indexOf(romanChar);

    const powerExponent = Math.floor(symbolIndex / 2);
    const baseValue = Math.pow(10, powerExponent);
    const divisorForValue = 2 - (symbolIndex % 2);

    return baseValue / divisorForValue;
}

for (currentCharacterIndex = 0; currentCharacterIndex < inputDataString.length; currentCharacterIndex++) {
    const currentCharacter = inputDataString[currentCharacterIndex];

    if (currentCharacter === '\n') {
        console.log(currentLineAccumulatedSum);
        
        currentLineAccumulatedSum = 0;
        previousCharacterNumericValue = 0;
        currentCharacterNumericValue = 0;
    } else {
        currentCharacterNumericValue = calculateRomanCharValue(currentCharacter, ROMAN_NUMERAL_SYMBOLS);

        if (currentCharacterNumericValue > previousCharacterNumericValue) {
            currentLineAccumulatedSum -= previousCharacterNumericValue * 2;
        }
        
        currentLineAccumulatedSum += currentCharacterNumericValue;

        previousCharacterNumericValue = currentCharacterNumericValue;
    }
}
