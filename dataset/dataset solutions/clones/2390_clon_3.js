function processInputData(rawData) {
    const lines = rawData.split("\n");

    const shiftAmount = parseInt(lines[0]);
    const inputCharacters = lines[1].split("");

    const alphabetChars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const alphabetSize = alphabetChars.length; // 26

    const getAlphabetIndex = (char) => {
        return alphabetChars.indexOf(char);
    };

    const getAlphabetChar = (index) => {
        return alphabetChars[index];
    };

    const characterIndices = inputCharacters.map(char => getAlphabetIndex(char));

    // The original code uses inputN % 25 for the shift, which is peculiar but must be preserved.
    // (alphabetSize - 1) is 25.
    const effectiveShift = shiftAmount % (alphabetSize - 1);

    let encodedResult = '';

    for (let charPosition = 0; charPosition < characterIndices.length; charPosition++) {
        const originalCharValue = characterIndices[charPosition];

        // Original logic:
        // var temp = inputNum[i] + inputNPer;
        // if (temp > 25) temp = temp % 26;
        // This is equivalent to (originalCharValue + effectiveShift) % alphabetSize
        const shiftedCharValue = (originalCharValue + effectiveShift) % alphabetSize;

        encodedResult += getAlphabetChar(shiftedCharValue);
    }

    console.log(encodedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
