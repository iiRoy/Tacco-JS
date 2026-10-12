function processStringData(sourceText) {
    const characterSequence = [...sourceText];

    const firstAOccurrence = characterSequence.reduce((accumulator, currentCharacter, currentIndex) => {
        if (accumulator.position === -1 && currentCharacter === "A") {
            return { position: currentIndex };
        }
        return accumulator;
    }, { position: -1 });

    const lastZOccurrence = characterSequence.reduce((accumulator, currentCharacter, currentIndex) => {
        if (currentCharacter === "Z") {
            return currentIndex;
        }
        return accumulator;
    }, -1);

    const calculatedSpan = lastZOccurrence - firstAOccurrence.position + 1;
    process.stdout.write(calculatedSpan);
}

processStringData(require("fs").readFileSync("/dev/stdin", "utf8"));
