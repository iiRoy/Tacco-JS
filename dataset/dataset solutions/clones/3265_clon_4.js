function processInput(rawText) {
    const neededDigits = new Set(["1", "9", "7", "4"]);

    const scannedSegments = rawText.split(" ").slice(0, 4);

    const collectedData = scannedSegments.reduce((accumulator, currentSegment) => {
        if (neededDigits.has(currentSegment)) {
            accumulator.distinctMatches.add(currentSegment);
            accumulator.matchTally++;
        }
        return accumulator;
    }, { distinctMatches: new Set(), matchTally: 0 });

    const allPresent = collectedData.distinctMatches.size === neededDigits.size;
    const correctQuantity = collectedData.matchTally === neededDigits.size;

    const finalVerdict = (allPresent && correctQuantity) ? "YES" : "NO";

    console.log(finalVerdict);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));