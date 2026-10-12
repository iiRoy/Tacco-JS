function ProcessInput(rawInput) {
    const inputLines = rawInput.split("\n");
    const firstLineData = inputLines[0].split(" ");
    // const unusedValueN = parseInt(firstLineData[0]); // N is not utilized in the original logic
    const targetDistinctCount = parseInt(firstLineData[1]);
    const elementStrings = inputLines[1].split(" ");

    const frequencyRegistry = elementStrings.reduce((accumulator, currentItem) => {
        const currentTally = accumulator.get(currentItem) || 0;
        return accumulator.set(currentItem, currentTally + 1);
    }, new Map());

    const sortedFrequencyPairs = Array.from(frequencyRegistry.entries());

    sortedFrequencyPairs.sort((pairA, pairB) => pairA[1] - pairB[1]);

    const uniqueElementCount = sortedFrequencyPairs.length;

    if (uniqueElementCount < targetDistinctCount) {
        console.log("0");
        return;
    }

    const typesToDiscard = uniqueElementCount - targetDistinctCount;

    const totalElementsToEliminate = sortedFrequencyPairs
        .slice(0, typesToDiscard)
        .reduce((sumAccumulator, currentPair) => sumAccumulator + currentPair[1], 0);

    console.log(totalElementsToEliminate);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
