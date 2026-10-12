function processInput(rawInputText) {
    const trimmedInput = rawInputText.trim();
    const inputLines = trimmedInput.split("\n");

    const totalLength = Number(inputLines[0]);
    const targetString = inputLines[1];

    const splitPointIndicators = Array.from({ length: totalLength - 1 }, (_, index) => index + 1);

    const calculatedIntersectionSizes = splitPointIndicators.map(currentSplitPoint => {
        const firstSegment = targetString.slice(0, currentSplitPoint);
        const secondSegment = targetString.slice(currentSplitPoint, totalLength);

        const uniqueCharsInFirst = new Set([...firstSegment]);
        const uniqueCharsInSecond = new Set([...secondSegment]);

        let currentIntersectionCount = 0;
        for (const character of uniqueCharsInFirst) {
            if (uniqueCharsInSecond.has(character)) {
                currentIntersectionCount++;
            }
        }
        return currentIntersectionCount;
    });

    if (calculatedIntersectionSizes.length === 0) {
        console.log(-Infinity);
    } else {
        console.log(Math.max(...calculatedIntersectionSizes));
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
