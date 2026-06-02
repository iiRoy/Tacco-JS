function processInput(incomingText) {
    const userCharacters = incomingText.split("");
    const referenceSequence = ["C", "O", "D", "E", "F", "E", "S", "T", "I", "V", "A", "L", "2", "0", "1", "6"];

    const mismatchCount = userCharacters.reduce((currentTotal, charFromInput, charIndex) => {
        return currentTotal + (charFromInput !== referenceSequence[charIndex] ? 1 : 0);
    }, 0);

    console.log(mismatchCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
