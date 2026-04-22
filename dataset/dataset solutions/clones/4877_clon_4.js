function analyzeCharacterChanges(sourceString) {
    if (sourceString.length === 0) {
        console.log(0);
        return;
    }

    const initialCharacter = sourceString.charAt(0);
    const remainingCharacters = sourceString.slice(1).split('');

    const resultantMetrics = remainingCharacters.reduce((currentMetrics, nextCharacter) => {
        if (currentMetrics.lastEncountered !== nextCharacter) {
            currentMetrics.changeCounter++;
            currentMetrics.lastEncountered = nextCharacter;
        }
        return currentMetrics;
    }, { lastEncountered: initialCharacter, changeCounter: 0 });

    console.log(resultantMetrics.changeCounter);
}

analyzeCharacterChanges(require("node:fs").readFileSync("/dev/stdin", "utf8"));