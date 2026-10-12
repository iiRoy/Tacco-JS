const ALPHABET_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const ALPHABET_SIZE = 26;
const TARGET_PHRASE_REGEX = /th(e|is|at)/;

function performCaesarCipher(inputText, shiftValue, alphabetReference) {
    return inputText.replace(/[a-z]/g, function(originalChar) {
        const charPosition = alphabetReference.indexOf(originalChar);
        const newPosition = (charPosition + shiftValue) % alphabetReference.length;
        return alphabetReference[newPosition];
    });
}

const fileSystemModule = require("fs");
const rawFileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const linesToProcess = rawFileContent.split('\n');

linesToProcess.forEach(function(currentInputLine) {
    for (let currentShift = ALPHABET_SIZE - 1; currentShift >= 0; currentShift--) {
        const decipheredLine = performCaesarCipher(currentInputLine, currentShift, ALPHABET_CHARS);
        if (decipheredLine.match(TARGET_PHRASE_REGEX)) {
            console.log(decipheredLine);
        }
    }
});
