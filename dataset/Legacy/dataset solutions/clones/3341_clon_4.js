function Main(rawInputData) {
    const lines = rawInputData.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const initialValues = lines[1].split(" ").map(val => parseInt(val, 10));

    const cumulativeSums = new Array(elementCount);
    cumulativeSums[0] = initialValues[0];
    for (let idx = 1; idx < elementCount; ++idx) {
        cumulativeSums[idx] = cumulativeSums[idx - 1] + initialValues[idx];
    }

    const getSegmentSum = (startIdx, endIdx) => {
        if (startIdx > endIdx) return 0;
        const total = cumulativeSums[endIdx];
        const previous = (startIdx > 0) ? cumulativeSums[startIdx - 1] : 0;
        return total - previous;
    };

    const costMemo = Array.from({ length: elementCount }, () => Array(elementCount).fill(null));

    const calculateSegmentMergeCost = (startIdx, endIdx) => {
        if (startIdx === endIdx) {
            return 0;
        }

        if (costMemo[startIdx][endIdx] !== null) {
            return costMemo[startIdx][endIdx];
        }

        let minimumCurrentSegmentCost = Infinity;

        for (let splitPoint = startIdx; splitPoint < endIdx; ++splitPoint) {
            const leftSubproblemCost = calculateSegmentMergeCost(startIdx, splitPoint);
            const rightSubproblemCost = calculateSegmentMergeCost(splitPoint + 1, endIdx);
            const currentMergeOperationCost = getSegmentSum(startIdx, endIdx);

            const totalCostForThisSplit = leftSubproblemCost + rightSubproblemCost + currentMergeOperationCost;
            minimumCurrentSegmentCost = Math.min(minimumCurrentSegmentCost, totalCostForThisSplit);
        }

        costMemo[startIdx][endIdx] = minimumCurrentSegmentCost;
        return minimumCurrentSegmentCost;
    };

    const finalOptimalCost = calculateSegmentMergeCost(0, elementCount - 1);

    console.log('%s', finalOptimalCost);
    return finalOptimalCost;
}

function debug(testCaseNumber) {
    const inputElement = document.getElementById("input" + testCaseNumber);
    if (!inputElement) {
        console.error("Input element not found for test case:", testCaseNumber);
        return;
    }
    const testInput = inputElement.value;
    const computedAnswer = Main(testInput);
    const outputElement = document.getElementById("output" + testCaseNumber);
    if (!outputElement) {
        console.error("Output element not found for test case:", testCaseNumber);
        return;
    }
    const expectedOutput = outputElement.value.split("\n")[0];
    let testResult = "WA";
    if (String(computedAnswer) === expectedOutput) {
        testResult = "AC";
    }
    const resultElement = document.getElementById("result" + testCaseNumber);
    if (resultElement) {
        resultElement.innerHTML = testResult;
    } else {
        console.error("Result element not found for test case:", testCaseNumber);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
