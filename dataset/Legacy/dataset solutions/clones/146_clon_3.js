const fsModule = require("fs");

const PATTERN_C_VAL = "1111";
const PATTERN_F_VAL = "111";
const PATTERN_D_VAL = "1101";
const PATTERN_B_VAL = "101";
const PATTERN_G_VAL = "1000001";
const PATTERN_A_VAL = "10000001";

function evaluateStringPatterns(inputString) {
    let foundIndex;

    foundIndex = inputString.indexOf(PATTERN_C_VAL);
    if (foundIndex !== -1) {
        return "C";
    }

    foundIndex = inputString.indexOf(PATTERN_F_VAL);
    if (foundIndex !== -1) {
        return "F";
    }

    foundIndex = inputString.indexOf(PATTERN_D_VAL);
    if (foundIndex !== -1) {
        return "D";
    }

    foundIndex = inputString.indexOf(PATTERN_B_VAL);
    if (foundIndex !== -1) {
        return "B";
    }

    foundIndex = inputString.indexOf(PATTERN_G_VAL);
    if (foundIndex !== -1) {
        return "G";
    }

    foundIndex = inputString.indexOf(PATTERN_A_VAL);
    if (foundIndex !== -1) {
        return "A";
    }

    return "E";
}

const rawFileContent = fsModule.readFileSync("/dev/stdin", "utf8");

const trimmedContent = rawFileContent.trim();
const inputBlocks = trimmedContent.split('\n\n');

inputBlocks.forEach((currentInputSegment) => {
    const cleanedSegment = currentInputSegment.replace(/\s/g, '');
    const determinedCharacterCode = evaluateStringPatterns(cleanedSegment);
    console.log(determinedCharacterCode);
});
