function processInputData(rawData) {
    let currentTallyT = 0;
    let currentTallyA = 0;

    const lineDelimiter = "\n";
    const valueDelimiter = " ";

    const inputLines = rawData.split(lineDelimiter);

    const numEntries = Number(inputLines[0]);
    console.log(numEntries);

    const parseEntryValues = (entryLine) => {
        const parts = entryLine.split(valueDelimiter);
        const tValue = Number(parts[0]);
        const aValue = Number(parts[1]);
        return { t: tValue, a: aValue };
    };

    const calculateNextTallies = (previousT, previousA, currentT, currentA) => {
        if (previousT <= currentT && previousA <= currentA) {
            return { nextT: currentT, nextA: currentA };
        } else {
            const tRatio = previousT / currentT;
            const aRatio = previousA / currentA;
            const maximumRatio = Math.max(tRatio, aRatio);
            const scalingFactor = Math.ceil(maximumRatio);
            return { nextT: currentT * scalingFactor, nextA: currentA * scalingFactor };
        }
    };

    for (let entryIndex = 1; entryIndex <= numEntries; entryIndex++) {
        const { t: currentT, a: currentA } = parseEntryValues(inputLines[entryIndex]);

        const updatedTallies = calculateNextTallies(currentTallyT, currentTallyA, currentT, currentA);
        currentTallyT = updatedTallies.nextT;
        currentTallyA = updatedTallies.nextA;
    }

    console.log(currentTallyT + currentTallyA + "\n");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
