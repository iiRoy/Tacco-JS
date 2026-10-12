function processInputData(rawData) {
    const allInputLines = rawData.split('\n');

    const [criteriaLine, ...dataEntryLines] = allInputLines;

    const criteriaParts = criteriaLine.split(' ').map(Number);
    const lowerBoundA = criteriaParts[1];
    const lowerBoundB = criteriaParts[2];

    const matchingEntryCount = dataEntryLines.filter(entryText => {
        if (!entryText.trim()) {
            return false;
        }
        const entryParts = entryText.split(' ').map(Number);
        const currentValA = entryParts[0];
        const currentValB = entryParts[1];

        return currentValA >= lowerBoundA && currentValB >= lowerBoundB;
    }).length;

    console.log(matchingEntryCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
