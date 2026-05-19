const NOT_FOUND_INDEX = -1;

function processInputString(sourceString) {
    const lowerCaseAlphabet = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const getTransformedCharacter = (charToProcess, lowerSet, upperSet) => {
        if (lowerSet.indexOf(charToProcess) !== NOT_FOUND_INDEX) {
            return charToProcess.toUpperCase();
        } else if (upperSet.indexOf(charToProcess) !== NOT_FOUND_INDEX) {
            return charToProcess.toLowerCase();
        } else {
            return charToProcess;
        }
    };

    let processedCharacters = [];
    const stringLength = sourceString.length;

    for (let charPosition = 0; charPosition < stringLength; charPosition++) {
        const currentChar = sourceString[charPosition];
        const transformed = getTransformedCharacter(currentChar, lowerCaseAlphabet, upperCaseAlphabet);
        processedCharacters.push(transformed);
    }

    const finalResult = processedCharacters.join('');
    console.log(finalResult.trim());
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf-8"));
