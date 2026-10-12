function processGameData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const totalEntries = parseInt(inputLines[0]);

    let currentIdx = 0;
    let outcomeIndicator = "No";

    const parseDicePair = (lineContent) => {
        return lineContent.split(" ").map(Number);
    };

    const isDoubleRoll = (pairArray) => {
        return pairArray[0] === pairArray[1];
    };

    while (currentIdx < totalEntries - 2) {
        const firstRollLine = inputLines[currentIdx + 1];
        const firstRollPair = parseDicePair(firstRollLine);

        if (isDoubleRoll(firstRollPair)) {
            const secondRollLine = inputLines[currentIdx + 2];
            const secondRollPair = parseDicePair(secondRollLine);

            if (isDoubleRoll(secondRollPair)) {
                const thirdRollLine = inputLines[currentIdx + 3];
                const thirdRollPair = parseDicePair(thirdRollLine);

                if (isDoubleRoll(thirdRollPair)) {
                    outcomeIndicator = "Yes";
                    break;
                } else {
                    currentIdx += 3;
                }
            } else {
                currentIdx += 2;
            }
        } else {
            currentIdx += 1;
        }
    }

    console.log(outcomeIndicator);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
