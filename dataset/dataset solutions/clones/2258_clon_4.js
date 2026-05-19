function processInputAndCompute(inputPayload) {
    const modulusValue = 1000000007;

    const processedLines = inputPayload.split("\n").map(line =>
        line.split(" ").map(Number)
    );

    const nValue = processedLines[0][0];
    const kValue = processedLines[0][1];
    const dataSequence = processedLines[1];

    const combinationCollection = obtainCombinations(nValue, kValue);

    let finalAccumulation = 0;

    for (const currentCombination of combinationCollection) {
        finalAccumulation = (finalAccumulation + deriveMinMaxDifference(dataSequence, currentCombination)) % modulusValue;
    }

    console.log(finalAccumulation);
}

function deriveMinMaxDifference(sourceArray, indexPattern) {
    let currentMinimum = sourceArray[indexPattern[0] - 1];
    let currentMaximum = sourceArray[indexPattern[0] - 1];

    const { minVal, maxVal } = indexPattern.slice(1).reduce((acc, currentIdx) => {
        const valueAtIndex = sourceArray[currentIdx - 1];
        acc.minVal = Math.min(acc.minVal, valueAtIndex);
        acc.maxVal = Math.max(acc.minVal, valueAtIndex);
        return acc;
    }, { minVal: currentMinimum, maxVal: currentMaximum });

    return maxVal - minVal;
}

function obtainCombinations(upperBound, selectionCount) {
    const allCombinations = [];

    function generateRecursive(currentCombo, startNum) {
        if (currentCombo.length === selectionCount) {
            allCombinations.push([...currentCombo]);
            return;
        }

        for (let num = startNum; num <= upperBound - (selectionCount - currentCombo.length - 1); num++) {
            currentCombo.push(num);
            generateRecursive(currentCombo, num + 1);
            currentCombo.pop();
        }
    }

    generateRecursive([], 1);
    return allCombinations;
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
