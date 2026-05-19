function processInputData(rawData) {
    const RADIX_DECIMAL = 10;

    const inputLines = rawData.split("\n");

    const sequenceLength = parseInt(inputLines[0], RADIX_DECIMAL);

    const numericSequence = inputLines[1].split(" ").map(itemStr => parseInt(itemStr, RADIX_DECIMAL));

    let totalIncrease = 0;

    if (sequenceLength > 0) {
        totalIncrease = numericSequence[0];
    }

    for (let idx = 1; idx < sequenceLength; idx++) {
        const currentLevel = numericSequence[idx];
        const previousLevel = numericSequence[idx - 1];

        const levelDifference = currentLevel - previousLevel;

        totalIncrease += Math.max(0, levelDifference);
    }

    console.log(totalIncrease);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
