function* createTetrahedralSeries(upperBound) {
    let currentA = 1;
    let currentB = 1;
    let currentC = 1;
    while (currentA <= upperBound) {
        yield currentA;
        currentC++;
        currentB += currentC;
        currentA += currentB;
    }
}

function* filterOddNumbers(sourceGenerator) {
    for (const num of sourceGenerator) {
        if (num % 2 !== 0) {
            yield num;
        }
    }
}

function computeMinCombinations(targetLimit, valueGenerator) {
    const minCounts = new Array(targetLimit + 1).fill(1000000000);
    minCounts[0] = 0;

    for (const value of valueGenerator) {
        for (let currentSum = value; currentSum <= targetLimit; currentSum++) {
            minCounts[currentSum] = Math.min(minCounts[currentSum], minCounts[currentSum - value] + 1);
        }
    }
    return minCounts;
}

function processInputData(rawInput) {
    const inputLines = rawInput.split("\n");
    const maxVal = 1000000;

    const allTetrahedralNumbers = createTetrahedralSeries(maxVal);
    const dpTableAll = computeMinCombinations(maxVal, allTetrahedralNumbers);

    const oddTetrahedralNumbers = filterOddNumbers(createTetrahedralSeries(maxVal));
    const dpTableOdd = computeMinCombinations(maxVal, oddTetrahedralNumbers);

    let lineIndex = 0;
    while (true) {
        const currentN = parseInt(inputLines[lineIndex], 10);
        if (currentN === 0) {
            break;
        }
        const resultAll = dpTableAll[currentN];
        const resultOdd = dpTableOdd[currentN];
        console.log(resultAll, resultOdd);
        lineIndex++;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
