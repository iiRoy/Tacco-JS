const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

let currentLineIndex = 0;
const totalNodes = parseInt(inputLines[currentLineIndex++], 10);

const nodeDefinitions = Array.from({ length: totalNodes }, () => {
    const lineParts = inputLines[currentLineIndex++].split(" ");
    return {
        valueComponent: parseInt(lineParts[0], 10),
        weightComponent: parseInt(lineParts[1], 10)
    };
});

const totalQueries = parseInt(inputLines[currentLineIndex++], 10);

const querySpecifications = Array.from({ length: totalQueries }, () => {
    const lineParts = inputLines[currentLineIndex++].split(" ");
    return {
        startingNodeIndex: parseInt(lineParts[0], 10) - 1,
        maximumWeight: parseInt(lineParts[1], 10)
    };
});

function* generateAncestors(initialIndex) {
    let currentPosition = initialIndex;
    while (true) {
        yield currentPosition;
        if (currentPosition === 0) break;
        currentPosition = Math.floor(currentPosition / 2);
    }
}

querySpecifications.forEach(currentQuery => {
    let currentAccumulatedWeight = 0;
    let finalCalculatedValue = 0;

    for (const nodeIdentifier of generateAncestors(currentQuery.startingNodeIndex)) {
        const nodeDataEntry = nodeDefinitions[nodeIdentifier];
        currentAccumulatedWeight += nodeDataEntry.weightComponent;
        if (currentAccumulatedWeight <= currentQuery.maximumWeight) {
            finalCalculatedValue += nodeDataEntry.valueComponent;
        }
    }
    console.log(finalCalculatedValue);
});
