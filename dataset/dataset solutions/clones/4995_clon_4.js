function processInput(sourceText) {
    const characterSequence = sourceText.split("");

    const characterTallies = characterSequence.reduce((accumulatorMap, currentCharacter) => {
        accumulatorMap.set(currentCharacter, (accumulatorMap.get(currentCharacter) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const allFrequenciesEven = Array.from(characterTallies.values()).every(
        (tallyValue) => tallyValue % 2 === 0
    );

    if (allFrequenciesEven) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
