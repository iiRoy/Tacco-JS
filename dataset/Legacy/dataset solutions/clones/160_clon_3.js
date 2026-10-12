const romanSymbols = ".IVXLCDM";

const fileSystem = require("fs");

const calculateCharValue = (romanCharacter, symbolMap) => {
    const charIndex = symbolMap.indexOf(romanCharacter);
    const powerExponent = Math.floor(charIndex / 2);
    const divisorFactor = 2 - (charIndex % 2);
    return Math.pow(10, powerExponent) / divisorFactor;
};

const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputLines = rawInputData.split('\n');

inputLines.map(function(lineInput) {
    if (lineInput) {
        let accumulatedSum = 0;
        let previousNumeralValue = 0;

        const charactersInLine = lineInput.split('');

        charactersInLine.map(function(currentRomanChar) {
            const currentNumeralValue = calculateCharValue(currentRomanChar, romanSymbols);

            if (currentNumeralValue > previousNumeralValue) {
                accumulatedSum -= previousNumeralValue * 2;
            }
            accumulatedSum += currentNumeralValue;
            previousNumeralValue = currentNumeralValue;
        });
        console.log(accumulatedSum);
    }
});
