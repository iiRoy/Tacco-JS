const processInputData = (rawText) => {
    return rawText
        .trim()
        .split('\n')
        .filter(row => row !== '0 0')
        .map(row => {
            const parts = row.split(' ');
            return { limit: +parts[0], desiredSum: +parts[1] };
        });
};

const calculateCombinations = (boundary, desiredTotal) => {
    let combinationCount = 0;
    for (let firstValue = 1; firstValue <= boundary - 2; firstValue++) {
        for (let secondValue = firstValue + 1; secondValue <= boundary - 1; secondValue++) {
            const thirdValue = desiredTotal - firstValue - secondValue;
            if (thirdValue > secondValue && thirdValue <= boundary) {
                combinationCount++;
            }
        }
    }
    return combinationCount;
};

const orchestrateExecution = (sourceData) => {
    const parsedData = processInputData(sourceData);
    const results = parsedData.map(item => calculateCombinations(item.limit, item.desiredSum));
    return results.join('\n');
};

const systemInput = require("node:fs").readFileSync(0, "utf-8");
console.log(orchestrateExecution(systemInput));