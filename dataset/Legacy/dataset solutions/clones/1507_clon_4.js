function ProcessInput(rawData) {
    const lineSegments = rawData.split('\n');
    const lineCount = Number(lineSegments[0]);

    const comparisonOutcomes = lineSegments.slice(1, lineCount + 1).map(currentLine => {
        const pairStrings = currentLine.split(' ');
        return Number(pairStrings[0]) === Number(pairStrings[1]);
    });

    const finalState = comparisonOutcomes.reduce(([foundTriple, currentStreak], isMatchResult) => {
        if (foundTriple) {
            return [true, 3];
        }
        if (isMatchResult) {
            const newStreak = currentStreak + 1;
            return [newStreak >= 3, newStreak];
        } else {
            return [false, 0];
        }
    }, [false, 0]);

    const outcomeIndicator = finalState[0] ? "Yes" : "No";

    console.log(outcomeIndicator);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
