const parseNum = (s) => Number.parseInt(s, 10);
const processNumArray = (arr) => arr.map(parseNum);
const getAbsoluteValue = (val) => Math.abs(val);
const getMinOfArgs = (...vals) => Math.min(...vals);
const getMaxOfArgs = (...vals) => Math.max(...vals);

const iterativeGCD = (a, b) => {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
};
const calculateGreatestCommonDivisor = (...nums) => nums.reduce(iterativeGCD);

function executeSolution(rawInputData) {
    const inputLines = rawInputData.split('\n');
    const countElements = parseNum(inputLines[0]);
    const numericValues = processNumArray(inputLines.slice(1, countElements + 1));

    numericValues.sort((a, b) => a - b);

    const computeWeightedSummation = (dataCollection, splitPointIndex) => {
        return dataCollection.reduce((accumulator, currentVal, currentIndex) => {
            return accumulator + (currentIndex < splitPointIndex ? -2 * currentVal : 2 * currentVal);
        }, 0);
    };

    let finalResult;

    if (countElements % 2 === 0) {
        const midpoint = countElements / 2;
        const initialSum = computeWeightedSummation(numericValues, midpoint);
        finalResult = initialSum + numericValues[midpoint] - numericValues[midpoint + 1];
    } else {
        const centralIndex = (countElements - 1) / 2;

        const candidateA_initial = computeWeightedSummation(numericValues, centralIndex);
        const candidateA_final = candidateA_initial - (numericValues[centralIndex] + numericValues[centralIndex + 1]);

        const candidateB_initial = computeWeightedSummation(numericValues, centralIndex + 1);
        const candidateB_final = candidateB_initial + (numericValues[centralIndex] + numericValues[centralIndex - 1]);
        
        finalResult = getMaxOfArgs(candidateA_final, candidateB_final);
    }

    console.log(finalResult);

    return 0;
}

executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
