function processInput(rawText) {
    const targetDigits = new Set(["1", "9", "7", "4"]);
    const inputParts = rawText.split(" ");

    const initialAccumulator = {
        foundUniqueDigits: new Set(),
        totalMatches: 0
    };

    const processingResult = inputParts.slice(0, 4).reduce((accumulator, currentPart) => {
        if (targetDigits.has(currentPart)) {
            accumulator.foundUniqueDigits.add(currentPart);
            accumulator.totalMatches++;
        }
        return accumulator;
    }, initialAccumulator);

    if (processingResult.foundUniqueDigits.size === 4 && processingResult.totalMatches === 4) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
