const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputData.trim().split("\n");

const numberOfTestCases = parseInt(processedInputLines.shift(), 10);

const initialKeypadLayout = ["", ".,!? ", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
const digitToCharMap = initialKeypadLayout.map(charSegment => charSegment.split(""));

for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; currentCaseIndex++) {
    const inputDigitSequence = processedInputLines[currentCaseIndex].split("").map(Number);

    let generatedOutputString = "";
    let lastCharacterPressed = "";
    let consecutivePressCount = -1;

    // Helper function to manage character selection for non-zero digits
    const updateCharacterSelection = (digit) => {
        consecutivePressCount++;
        const availableChars = digitToCharMap[digit];
        const charPosition = consecutivePressCount % availableChars.length;
        lastCharacterPressed = availableChars[charPosition];
    };

    // Helper function to append the selected character and reset state for a zero digit
    const finalizeCharacterAndReset = () => {
        generatedOutputString += lastCharacterPressed;
        consecutivePressCount = -1;
        lastCharacterPressed = "";
    };

    for (const currentInputDigit of inputDigitSequence) {
        if (currentInputDigit > 0) {
            updateCharacterSelection(currentInputDigit);
        } else { // currentInputDigit === 0
            finalizeCharacterAndReset();
        }
    }
    console.log(generatedOutputString);
}
