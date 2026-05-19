const fileSystemModule = require("fs");

const ALPHABET_SIZE = 26;
const LOWERCASE_A_CODE = 97;
const TARGET_PATTERN = /th(is|at)/;

function applyAffineCharTransform(charToProcess, multiplier, shiftValue) {
    const charCode = charToProcess.charCodeAt(0);
    const transformedCharCode = (charCode * multiplier + shiftValue) % ALPHABET_SIZE + LOWERCASE_A_CODE;
    return String.fromCharCode(transformedCharCode);
}

function applyAffineCipherToLine(inputLine, multiplier, shiftValue) {
    return inputLine.replace(/[\w]/g, function(charToTransform) {
        return applyAffineCharTransform(charToTransform, multiplier, shiftValue);
    });
}

function checkAndLogMatch(processedString) {
    const matchResult = processedString.match(TARGET_PATTERN);
    if (matchResult) {
        console.log(processedString);
    }
}

function processInputFileContent() {
    const fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const inputLines = fileContent.split('\n');

    inputLines.forEach(function(currentLine) {
        for (let currentMultiplier = ALPHABET_SIZE - 1; currentMultiplier >= 0; currentMultiplier--) {
            for (let currentShift = ALPHABET_SIZE - 1; currentShift >= 0; currentShift--) {
                const resultString = applyAffineCipherToLine(currentLine, currentMultiplier, currentShift);
                checkAndLogMatch(resultString);
            }
        }
    });
}

processInputFileContent();
