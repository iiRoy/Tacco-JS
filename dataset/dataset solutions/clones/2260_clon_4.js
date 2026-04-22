const MODULUS_VALUE = 1000000007;

const processRawData = (textualInput) => {
    const lines = textualInput.trim().split('\n');
    const config = lines[0].split(' ').map(Number);
    const data = lines[1].split(' ').map(Number);
    return { config, data };
};

const generateSubsets = (maxVal, subsetSize) => {
    const allSubsets = [];
    const currentSubset = [];

    const findSubsetsRecursive = (startIdx) => {
        if (currentSubset.length === subsetSize) {
            allSubsets.push([...currentSubset]);
            return;
        }

        for (let elemIdx = startIdx; elemIdx <= maxVal; elemIdx++) {
            currentSubset.push(elemIdx);
            findSubsetsRecursive(elemIdx + 1);
            currentSubset.pop();
        }
    };

    findSubsetsRecursive(1);
    return allSubsets;
};

const computeRangeDelta = (valueArray, indexPattern) => {
    if (indexPattern.length === 0) return 0;

    const selectedValues = indexPattern.map(idx => valueArray[idx - 1]);

    const { min, max } = selectedValues.reduce((acc, current) => ({
        min: Math.min(acc.min, current),
        max: Math.max(acc.max, current)
    }), { min: selectedValues[0], max: selectedValues[0] });

    return max - min;
};

const performCalculations = (inputString) => {
    const { config, data } = processRawData(inputString);
    const [numElements, subsetLength] = config;

    const combinationList = generateSubsets(numElements, subsetLength);

    const totalDifferenceSum = combinationList.reduce((currentSum, pattern) => {
        const delta = computeRangeDelta(data, pattern);
        return (currentSum + delta) % MODULUS_VALUE;
    }, 0);

    console.log(totalDifferenceSum);
};

performCalculations(require("fs").readFileSync("/dev/stdin", "utf8"));