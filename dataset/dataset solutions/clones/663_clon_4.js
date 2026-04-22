const rawContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawContent.trim().split('\n');

const generateSequence = (limit) => Array.from({ length: limit }, (_, k) => k);

const sliceMappers = new Map([
    ["xy", (valA, valB, extent) => generateSequence(extent).map(k => `${valA},${valB},${k}`)],
    ["xz", (valA, valB, extent) => generateSequence(extent).map(k => `${valA},${k},${valB}`)],
    ["yz", (valA, valB, extent) => generateSequence(extent).map(k => `${k},${valA},${valB}`)]
]);

let currentLineIndex = 0;

const processDataSets = () => {
    const headerRow = processedLines[currentLineIndex++];
    if (!headerRow || headerRow === "0 0") {
        return;
    }

    const [dimension, operationCount] = headerRow.split(" ").map(Number);

    const eliminatedPositions = new Set();

    for (let opIdx = 0; opIdx < operationCount; ++opIdx) {
        const operationDetails = processedLines[currentLineIndex++].split(" ");
        const operationType = operationDetails[0];
        const primaryCoord = Number(operationDetails[1]);
        const secondaryCoord = Number(operationDetails[2]);

        const coordinateGenerator = sliceMappers.get(operationType);
        if (coordinateGenerator) {
            coordinateGenerator(primaryCoord, secondaryCoord, dimension)
                .forEach(posKey => eliminatedPositions.add(posKey));
        }
    }

    const totalVolume = dimension * dimension * dimension;
    const remainingVolume = totalVolume - eliminatedPositions.size;
    console.info(remainingVolume);

    processDataSets();
};

processDataSets();