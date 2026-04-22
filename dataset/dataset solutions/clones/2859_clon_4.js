const extractInformation = (sourceData) => {
    const linesOfText = sourceData.split('\n');
    const quantityIndicator = Number(linesOfText[0]);
    const valueCollection = linesOfText[1].split(' ').map(Number);
    return { count: quantityIndicator, values: valueCollection };
};

const determineMinimumPartitionDifference = (parsedInput) => {
    const elementQuantity = parsedInput.count;
    const numericValues = parsedInput.values;

    if (elementQuantity === 2) {
        return Math.abs(numericValues[0] - numericValues[1]);
    }

    const aggregateSum = numericValues.reduce((currentTotal, item) => currentTotal + item, 0);

    let accumulatedSum = 0;
    const potentialSplitSums = numericValues.slice(0, elementQuantity - 1).map(item => {
        accumulatedSum += item;
        return accumulatedSum;
    });

    const calculatedDeltas = potentialSplitSums.map(segmentOneSum => {
        const segmentTwoSum = aggregateSum - segmentOneSum;
        return Math.abs(segmentOneSum - segmentTwoSum);
    });

    return Math.min(...calculatedDeltas);
};

const executeSolution = (sourceInputString) => {
    const structuredData = extractInformation(sourceInputString);
    const finalResult = determineMinimumPartitionDifference(structuredData);
    console.log(finalResult);
};

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));