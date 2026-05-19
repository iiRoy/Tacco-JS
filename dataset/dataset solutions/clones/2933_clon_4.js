function processCardGates(sourceContent) {
    const contentLines = sourceContent.split("\n");

    const initialParameters = contentLines[0].split(" ").map(Number);
    const totalCards = initialParameters[0];
    const numberOfGates = initialParameters[1];

    const gateIntervals = contentLines.slice(1, numberOfGates + 1).map(lineEntry =>
        lineEntry.split(" ").map(Number)
    );

    const startingRange = [1, totalCards];

    const finalPermittedRange = gateIntervals.reduce((accumulatedBounds, currentGateBounds) => {
        const [currentMinimum, currentMaximum] = accumulatedBounds;
        const [gateMinimum, gateMaximum] = currentGateBounds;

        const updatedMinimum = Math.max(currentMinimum, gateMinimum);
        const updatedMaximum = Math.min(currentMaximum, gateMaximum);

        return [updatedMinimum, updatedMaximum];
    }, startingRange);

    const [finalMinimum, finalMaximum] = finalPermittedRange;
    const possibleCardIdentifiers = Math.max(0, finalMaximum - finalMinimum + 1);

    console.log(possibleCardIdentifiers);
}

processCardGates(require("fs").readFileSync("/dev/stdin", "utf8"));
