const parseLineAndCalculateSum = (lineContent) => {
    const parts = lineContent.split(" ");
    const valA = parseInt(parts[0], 10);
    const valB = parseInt(parts[1], 10);
    const sumVal = valA + valB;
    return [valA, valB, sumVal];
};

function ProcessInputData(rawData) {
    const lines = rawData.split("\n");
    const itemCount = parseInt(lines[0], 10);

    const dataItems = lines.slice(1).map(parseLineAndCalculateSum).sort((itemA, itemB) => {
        return itemA[2] - itemB[2];
    });

    let scoreA = 0;
    let scoreB = 0;

    for (let idx = 0; idx < itemCount; idx++) {
        let currentOffset = 0;
        let bestOffsetInTieGroup = 0;
        const currentTieGroupSum = dataItems[idx][2];
        const comparisonTargetIndex = idx % 2;

        while (idx + currentOffset < itemCount && dataItems[idx + currentOffset][2] === currentTieGroupSum) {
            const candidateElement = dataItems[idx + currentOffset];
            const bestElementSoFar = dataItems[idx + bestOffsetInTieGroup];

            if (candidateElement[comparisonTargetIndex] > bestElementSoFar[comparisonTargetIndex]) {
                bestOffsetInTieGroup = currentOffset;
            }
            currentOffset++;
        }

        if (bestOffsetInTieGroup !== 0) {
            const tempItemCopy = dataItems[idx].slice();
            dataItems[idx] = dataItems[bestOffsetInTieGroup].slice();
            dataItems[bestOffsetInTieGroup] = tempItemCopy;
        }

        if (comparisonTargetIndex === 0) {
            scoreA += dataItems[idx][0];
        } else {
            scoreB += dataItems[idx][1];
        }
    }

    console.log('%d', scoreA - scoreB);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
