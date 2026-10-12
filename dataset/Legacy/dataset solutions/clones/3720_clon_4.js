function processInput(sourceText) {
    const characterSequence = Array.from(sourceText);

    const finalScore = characterSequence.reduce((currentAccumulation, currentSymbol) => {
        return currentAccumulation + (currentSymbol === '-' ? -1 : 1);
    }, 0);

    console.log(finalScore + '\n');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
