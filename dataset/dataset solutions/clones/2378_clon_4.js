const processSequence = (rawInputContent) => {
    const MODULUS_CONSTANT = 1000000007;

    const contentLines = rawInputContent.trim().split('\n');
    const firstLineParsed = contentLines[0].split(' ').map(Number);
    const inputSeriesLength = firstLineParsed[0];
    const numericalSeries = contentLines[1].split(' ').map(Number);

    let cumulativeProduct = 1;
    const categoryCounts = new Map([[0, 0], [1, 0], [2, 0]]);

    const firstSeriesItem = numericalSeries[0];
    if (firstSeriesItem !== 0) {
        return 0;
    }

    let initialChoiceCount = 0;
    categoryCounts.forEach(val => {
        if (val === 0) {
            initialChoiceCount++;
        }
    });

    cumulativeProduct = (cumulativeProduct * initialChoiceCount) % MODULUS_CONSTANT;

    // Based on the original's logic, the first encountered '0' would increment category 0.
    categoryCounts.set(0, categoryCounts.get(0) + 1);

    numericalSeries.slice(1).forEach(currentValueFromSeries => {
        let availableMatches = 0;
        categoryCounts.forEach(val => {
            if (val === currentValueFromSeries) {
                availableMatches++;
            }
        });

        cumulativeProduct = (cumulativeProduct * availableMatches) % MODULUS_CONSTANT;

        for (let categoryId = 0; categoryId < 3; categoryId++) {
            if (categoryCounts.get(categoryId) === currentValueFromSeries) {
                categoryCounts.set(categoryId, categoryCounts.get(categoryId) + 1);
                break;
            }
        }
    });

    return cumulativeProduct;
};

const entryPointFunction = (dataPayload) => {
    return processSequence(dataPayload);
};

const filesystemAccess = require("fs");
const receivedData = filesystemAccess.readFileSync("/dev/stdin", "utf8");
const finalOutput = entryPointFunction(receivedData);
console.log(finalOutput);