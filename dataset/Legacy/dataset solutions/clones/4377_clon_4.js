function processInputData(sourceText) {
    const characterSequence = sourceText.split('');
    const filteredCharacters = characterSequence.filter((_charElement, idxPosition) => idxPosition % 2 === 0);
    const resultString = filteredCharacters.join('');
    console.log(resultString);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
