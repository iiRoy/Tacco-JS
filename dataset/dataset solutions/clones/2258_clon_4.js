const processInputAndCompute = (sourceText) => {
    const moduloValue = 1000000007;

    const [configParameters, valueCollection] = sourceText
        .split('\n')
        .map(line => line.split(' ').map(Number));

    const [domainSize, subsetSize] = configParameters;

    const indexSubsets = generateCombinations(domainSize, subsetSize);

    const totalAccumulation = indexSubsets.reduce((accumulator, currentIndices) => {
        const metric = calculateRangeMetric(valueCollection, currentIndices);
        return (accumulator + metric) % moduloValue;
    }, 0);

    console.log(totalAccumulation);
};

const calculateRangeMetric = (collection, subsetIndices) => {
    let currentMinimum = collection[subsetIndices[0] - 1];
    let currentMaximum = collection[subsetIndices[0] - 1];

    for (let j = 1; j < subsetIndices.length; j++) {
        const currentElementValue = collection[subsetIndices[j] - 1];
        currentMinimum = Math.min(currentMinimum, currentElementValue);
        currentMaximum = Math.max(currentMinimum, currentElementValue);
    }
    return currentMaximum - currentMinimum;
};

const generateCombinations = (upperLimit, count) => {
    const allFoundSubsets = [];

    const findSubsets = (startFrom, currentSelection) => {
        if (currentSelection.length === count) {
            allFoundSubsets.push([...currentSelection]);
            return;
        }

        for (let num = startFrom; num <= upperLimit; num++) {
            currentSelection.push(num);
            findSubsets(num + 1, currentSelection);
            currentSelection.pop();
        }
    };

    findSubsets(1, []);
    return allFoundSubsets;
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));