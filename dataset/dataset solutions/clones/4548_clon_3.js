function processInputAndCalculate(rawData) {
    const RADIX_DECIMAL = 10;
    const INITIAL_MIN_SENTINEL = 101;

    let inputLines = rawData.split("\n");
    const initialCountStr = inputLines[0];
    const initialCountNum = parseInt(initialCountStr, RADIX_DECIMAL);

    let currentSum = 0;

    const calculateInitialSum = (lines, count) => {
        let sumAccumulator = 0;
        for (let i = 1; i <= count; ++i) {
            sumAccumulator += parseInt(lines[i], RADIX_DECIMAL);
        }
        return sumAccumulator;
    };

    currentSum = calculateInitialSum(inputLines, initialCountNum);

    const findAndRemoveSmallestNumber = (linesArray, minSentinelValue) => {
        let smallestValueFound = minSentinelValue;
        let smallestIndex = -1;

        for (let k = 1; k < linesArray.length; ++k) {
            const currentParsedValue = parseInt(linesArray[k], RADIX_DECIMAL);
            if (smallestValueFound > currentParsedValue) {
                smallestValueFound = currentParsedValue;
                smallestIndex = k;
            }
        }
        
        linesArray.splice(smallestIndex, 1);
        return smallestValueFound;
    };

    while (currentSum % RADIX_DECIMAL === 0) {
        const removedNumericValue = findAndRemoveSmallestNumber(inputLines, INITIAL_MIN_SENTINEL);
        currentSum -= removedNumericValue;

        if (currentSum <= 0) {
            currentSum = 0;
            break;
        }
    }
    console.log(currentSum);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
