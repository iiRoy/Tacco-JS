const isNotMultipleOfTen = (value) => value % 10 !== 0;

function processPoints(rawPoints) {
    let multiplesOfTen = [];
    let nonMultiples = [];
    let sumOfMultiples = 0;

    for (const itemStr of rawPoints) {
        const numVal = Number(itemStr);
        if (numVal % 10 === 0) {
            multiplesOfTen.push(numVal);
            sumOfMultiples += numVal;
        } else {
            nonMultiples.push(numVal);
        }
    }

    return {
        multiplesOfTen: multiplesOfTen,
        sumOfMultiples: sumOfMultiples,
        nonMultiples: nonMultiples,
    };
}

function calculateMaxPatternValue(initialVal, exclusionIdx, classificationData) {
    const remainingNumsForCalc = classificationData.nonMultiples.filter((_, index) => index !== exclusionIdx);
    return recursiveCalculation(initialVal + classificationData.sumOfMultiples, remainingNumsForCalc, 0);
}

function recursiveCalculation(currentSum, remainingNums, currentIdx) {
    if (currentIdx >= remainingNums.length) {
        return currentSum;
    }

    const pathAValue = recursiveCalculation(currentSum + remainingNums[currentIdx], remainingNums, currentIdx + 1);
    const pathBValue = recursiveCalculation(currentSum, remainingNums, currentIdx + 1);

    const isPathAValid = isNotMultipleOfTen(pathAValue);
    const isPathBValid = isNotMultipleOfTen(pathBValue);

    if (isPathAValid && isPathBValid) {
        return Math.max(pathAValue, pathBValue);
    } else if (isPathAValid) {
        return pathAValue;
    } else if (isPathBValid) {
        return pathBValue;
    } else {
        return 0;
    }
}

function processInputAndFindMax(input) {
    const inputLines = input.split("\n");
    const classificationData = processPoints(inputLines.slice(1));

    let maxCalculatedValue = 0;

    maxCalculatedValue = classificationData.nonMultiples.reduce((currentMax, numVal, index) => {
        const patternResult = calculateMaxPatternValue(numVal, index, classificationData);
        return Math.max(currentMax, patternResult);
    }, 0);

    return maxCalculatedValue;
}

console.log(processInputAndFindMax(require("fs").readFileSync("/dev/stdin", "utf8")));
