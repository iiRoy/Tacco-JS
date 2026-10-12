var fileSystem = require("fs");
processInput(fileSystem.readFileSync("/dev/stdin", "utf-8"));

function processInput(sourceText) {
    const relevantLine = sourceText.split("\n")[0];
    const characterSequence = Array.from(relevantLine);

    const finalResult = characterSequence.reduce((accumulator, currentCharacter, indexPosition) => {
        return indexPosition % 2 === 0 ? accumulator + currentCharacter : accumulator;
    }, '');

    console.log(finalResult);
}
