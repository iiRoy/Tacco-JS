const inputBuffer = `5
2
1
2
3
3`.split('\n');
let inputCursor = 0;

const getNextInputLine = () => inputBuffer[inputCursor++];

const parseInputInteger = () => parseInt(getNextInputLine(), 10);

const executeDynamicProgramming = () => {
    let initialTargetValue = parseInputInteger();
    const numberOfRanges = parseInputInteger();

    const adjustedTargetValue = initialTargetValue - 1;

    const dpStateArraySize = adjustedTargetValue + 1;
    const dpStateArray = Array(dpStateArraySize).fill(0);

    const allowedStepValues = new Set();

    const moduloConstant = 998244353;

    for (let rangeIteration = 0; rangeIteration < numberOfRanges; ++rangeIteration) {
        const currentRangeStart = parseInputInteger();
        const currentRangeEnd = parseInputInteger();

        for (let stepCandidate = currentRangeStart; stepCandidate <= currentRangeEnd; ++stepCandidate) {
            allowedStepValues.add(stepCandidate);
        }
    }

    for (const singleStep of allowedStepValues) {
        if (singleStep <= adjustedTargetValue) {
            dpStateArray[singleStep] = (dpStateArray[singleStep] + 1) % moduloConstant;
        }
    }

    for (let currentSumIndex = 2; currentSumIndex <= adjustedTargetValue; ++currentSumIndex) {
        for (const stepSize of allowedStepValues) {
            if (currentSumIndex > stepSize) {
                const previousSumIndex = currentSumIndex - stepSize;
                const waysFromPreviousSum = dpStateArray[previousSumIndex];
                
                let currentWaysToSum = dpStateArray[currentSumIndex];
                let updatedWaysToSum = (currentWaysToSum + waysFromPreviousSum) % moduloConstant;
                dpStateArray[currentSumIndex] = updatedWaysToSum;
            }
        }
    }

    const finalComputedResult = dpStateArray[adjustedTargetValue] % moduloConstant;
    console.log(finalComputedResult);
};

executeDynamicProgramming();
