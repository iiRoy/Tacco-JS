function parseInputToNumbers(rawTextContent) {
    return rawTextContent.split("\n").map(lineSegment =>
        lineSegment.split(" ").map(Number)
    );
}

function evaluatePatternDifference(sourceValues, selectedIndices) {
    const subsetValues = selectedIndices.map(idx => sourceValues[idx - 1]);
    const minimumElement = Math.min(...subsetValues);
    const maximumElement = Math.max(...subsetValues);
    return maximumElement - minimumElement;
}

function generateCombinations(totalElementsCount, chooseCount) {
    const allCombinations = [];

    function formSubset(startFrom, currentSubset) {
        if (currentSubset.length === chooseCount) {
            allCombinations.push([...currentSubset]);
            return;
        }

        for (let element = startFrom; element <= totalElementsCount; element++) {
            currentSubset.push(element);
            formSubset(element + 1, currentSubset);
            currentSubset.pop();
        }
    }

    formSubset(1, []);
    return allCombinations;
}

function processInputData(rawInputString) {
    const primeModulo = 1000000007;
    const numericDataArrays = parseInputToNumbers(rawInputString);
    const [totalItems, selectionSize] = numericDataArrays[0];
    const valueArray = numericDataArrays[1];

    const combinationSets = generateCombinations(totalItems, selectionSize);

    const finalAccumulatedSum = combinationSets.reduce((currentSum, currentPattern) => {
        const differenceValue = evaluatePatternDifference(valueArray, currentPattern);
        return (currentSum + differenceValue) % primeModulo;
    }, 0);

    console.log(finalAccumulatedSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
