function readInputLines() {
    const fileSystemModule = require("fs");
    var fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const lineSeparator = /\n\r?/;
    return fileContent.split(lineSeparator);
}

function processCharacterCase(inputChar) {
    const isLowerCaseRegex = /[a-z]/;
    const isUpperCaseRegex = /[A-Z]/;

    if (isLowerCaseRegex.test(inputChar)) {
        return inputChar.toUpperCase();
    } else if (isUpperCaseRegex.test(inputChar)) {
        return inputChar.toLowerCase();
    } else {
        return inputChar;
    }
}

const allInputLines = readInputLines();
const firstInputLine = allInputLines[0];

const charactersInLine = firstInputLine.split('');

const transformedCharacters = charactersInLine.map(processCharacterCase);

const finalResultString = transformedCharacters.join('');

console.log(finalResultString);
