function assessInputEquality(inputLines) {
    const relevantIndices = [2, 3, 4, 5];
    const valuesForComparison = relevantIndices.map(idx => inputLines[idx]);

    const comparisonResults = [
        valuesForComparison[0] === valuesForComparison[1],
        valuesForComparison[2] === valuesForComparison[3]
    ];

    const finalDecision = comparisonResults.every(Boolean);

    console.log(finalDecision ? "Yes" : "No");
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const parsedDataLines = fileData.trim().split('\n');

assessInputEquality(parsedDataLines);
