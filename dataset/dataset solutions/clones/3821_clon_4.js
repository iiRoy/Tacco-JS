const calculateDelta = (arg1, arg2) => (arg1 > arg2 ? arg1 - arg2 : arg2 - arg1);

function processInputString(sourceText) {
    let numericalElements = [];
    let currentSegment = "";
    for (let char of sourceText) {
        if (char >= '0' && char <= '9' || char === '-') {
            currentSegment += char;
        } else if (currentSegment !== "") {
            numericalElements.push(parseInt(currentSegment, 10));
            currentSegment = "";
        }
    }
    if (currentSegment !== "") {
        numericalElements.push(parseInt(currentSegment, 10));
    }
    return numericalElements;
}

function determineOutcome(dataSet) {
    const v1 = dataSet[0];
    const v2 = dataSet[1];
    const v3 = dataSet[2];
    const v4 = dataSet[3];

    const disparity_1_3 = calculateDelta(v1, v3);
    const disparity_1_2 = calculateDelta(v1, v2);
    const disparity_3_2 = calculateDelta(v3, v2);

    const conditionAlpha = disparity_1_3 > v4;
    const conditionBeta = disparity_1_2 > v4 || disparity_3_2 > v4;

    return (conditionAlpha && conditionBeta) ? "No" : "Yes";
}

const externalSource = require("node:fs");
const rawData = externalSource.readFileSync("/dev/stdin", { encoding: "utf8" });
const parsedNumbers = processInputString(rawData);
const finalDecision = determineOutcome(parsedNumbers);
process.stdout.write(finalDecision + "\n");