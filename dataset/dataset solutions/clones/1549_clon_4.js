function processInput(rawInput) {
    const [firstLine, secondLine] = rawInput.split('\n');
    const sourceCharacters = [...firstLine];
    const targetCharacters = [...secondLine];

    if (targetCharacters.length > sourceCharacters.length) {
        console.log(undefined);
        return;
    }

    const comparisonStartIndex = sourceCharacters.length - targetCharacters.length;
    const relevantSourceSegment = sourceCharacters.slice(comparisonStartIndex);

    const mismatchTally = targetCharacters.reduce((accumulator, currentTargetChar, index) => {
        return accumulator + (currentTargetChar !== relevantSourceSegment[index] ? 1 : 0);
    }, 0);

    console.log(mismatchTally);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
