const processSource = (initialDataset) => {
    const extractNumericEntries = (lineSegment) =>
        lineSegment.match(/\d+/g).map(Number);

    const [configurationLine, dataLine] = initialDataset.split('\n');
    const [numElements, requiredCount] = extractNumericEntries(configurationLine);
    const baseElements = extractNumericEntries(dataLine);

    const cumulativeTotals = baseElements.reduce((accumulator, currentValue) => {
        accumulator.push((accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0) + currentValue);
        return accumulator;
    }, [0]);

    const segmentSums = Array.from({ length: numElements }, (_, currentIdxZeroBased) => {
        const currentIdx = currentIdxZeroBased + 1;
        return Array.from({ length: numElements - currentIdxZeroBased }, (_, lenIdx) => {
            const endIdx = currentIdx + lenIdx;
            return cumulativeTotals[endIdx] - cumulativeTotals[currentIdx - 1];
        });
    }).flat();

    const highestRelevantBit = 29;

    let finalOutcome = 0;
    let activeNumerals = [...segmentSums];

    for (let checkBitPosition = highestRelevantBit; checkBitPosition >= 0; checkBitPosition--) {
        const currentBitPower = 1 << checkBitPosition;

        const subsetWithBitSet = activeNumerals.filter(numeral => (numeral & currentBitPower) !== 0);

        if (subsetWithBitSet.length >= requiredCount) {
            finalOutcome |= currentBitPower;
            activeNumerals = subsetWithBitSet;
        }
    }

    console.log(finalOutcome);
};

processSource(require("fs").readFileSync("/dev/stdin", "utf8"));