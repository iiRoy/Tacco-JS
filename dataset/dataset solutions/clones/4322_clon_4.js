const numericSentinel = Number.MAX_SAFE_INTEGER;

const analyzeInput = (sourceText) => {
    const allRecords = sourceText.split('\n');
    const relevantRecords = allRecords.slice(1);

    const parsedDataPoints = relevantRecords.map(recordSegment => {
        const segments = recordSegment.match(/(-?\d+)\s+(-?\d+)/);
        if (!segments) {
            return null;
        }
        return {
            primaryValue: Number(segments[1]),
            auxiliaryValue: Number(segments[2])
        };
    }).filter(Boolean);

    const initialBestCandidate = { primaryValue: 0, auxiliaryValue: numericSentinel };

    const selectedCandidate = parsedDataPoints.reduce((currentChampion, challengerItem) => {
        return (challengerItem.primaryValue > currentChampion.primaryValue)
            ? challengerItem
            : currentChampion;
    }, initialBestCandidate);

    const finalSum = selectedCandidate.primaryValue + selectedCandidate.auxiliaryValue;

    process.stdout.write(finalSum.toString() + '\n');
};

analyzeInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());