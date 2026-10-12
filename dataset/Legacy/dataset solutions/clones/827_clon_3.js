function retrieveAndSplitInputLines() {
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawInputData.replace(/\n$/, "").split("\n");
}

function computeEntryPerformance(
    entryLabel,
    initialPrice,
    paramA,
    paramB,
    paramC,
    paramD,
    paramE,
    paramF,
    paramS,
    paramM
) {
    const calculatedTime = paramA + paramB + paramC + ((paramD + paramE) * paramM);
    const calculatedProfit = (paramF * paramS * paramM) - initialPrice;
    return {
        label: entryLabel,
        profit: calculatedProfit,
        time: calculatedTime
    };
}

const lineBuffer = retrieveAndSplitInputLines();
let resultsList = [];

while (true) {
    const numEntriesStr = lineBuffer.shift();
    const numEntries = parseInt(numEntriesStr, 10);

    if (numEntries === 0) {
        break;
    }

    resultsList = [];

    for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        const currentEntryLine = lineBuffer.shift();
        const lineSegments = currentEntryLine.split(" ");

        const entryName = lineSegments.shift();
        const numericParameters = lineSegments.map(Number);

        const [
            priceVal,
            valA,
            valB,
            valC,
            valD,
            valE,
            valF,
            valS,
            valM
        ] = numericParameters;

        const performanceMetrics = computeEntryPerformance(
            entryName,
            priceVal,
            valA,
            valB,
            valC,
            valD,
            valE,
            valF,
            valS,
            valM
        );

        const profitPerUnitTime = performanceMetrics.profit / performanceMetrics.time;
        resultsList.push([performanceMetrics.label, profitPerUnitTime, entryIndex]);
    }

    resultsList.sort((itemA, itemB) => {
        const ratioA = itemA[1];
        const ratioB = itemB[1];
        const originalIndexA = itemA[2];
        const originalIndexB = itemB[2];

        if (ratioA === ratioB) {
            return originalIndexA - originalIndexB;
        } else {
            return ratioB - ratioA;
        }
    });

    resultsList.forEach(resultItem => {
        console.log(resultItem[0]);
    });
    console.log("#");
}
