const romanValueMap = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
};

const fileSystemModule = require("fs");
const inputStringContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

let characterIndex = 0;
let currentRomanNumeralValue = 0;
let accumulatedSum = 0;
let previousRomanNumeralValue = 0;

const retrieveNumeralValue = (charKey) => {
    return romanValueMap[charKey];
};

while (characterIndex <= inputStringContent.length) {
    previousRomanNumeralValue = currentRomanNumeralValue;
    const currentCharacter = inputStringContent[characterIndex];
    characterIndex++;

    const mappedValue = retrieveNumeralValue(currentCharacter);

    if (mappedValue !== undefined) {
        currentRomanNumeralValue = mappedValue;
        if (currentRomanNumeralValue > previousRomanNumeralValue) {
            const subtractionAdjustment = 2 * previousRomanNumeralValue;
            accumulatedSum += currentRomanNumeralValue - subtractionAdjustment;
        } else {
            accumulatedSum += currentRomanNumeralValue;
        }
    } else {
        console.log(accumulatedSum);
        accumulatedSum = 0;
        currentRomanNumeralValue = 0;
        previousRomanNumeralValue = 0;
    }
}
