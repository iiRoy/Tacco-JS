function calculateAdjustedSum(rawInputString) {
    const parseInputData = (inputStr) => {
        const inputLines = inputStr.split("\n");
        const dataCount = parseInt(inputLines[0], 10);
        const originalValues = inputLines[1].split(" ").map(valueStr => parseInt(valueStr, 10));
        return { dataCount, originalValues };
    };

    const { dataCount, originalValues } = parseInputData(rawInputString);

    const adjustedValues = new Array(dataCount);
    adjustedValues[0] = 0;

    for (let currentIndex = 1; currentIndex < dataCount; currentIndex++) {
        const previousOriginalValue = originalValues[currentIndex - 1];
        const previousAdjustedValue = adjustedValues[currentIndex - 1];
        const currentOriginalValue = originalValues[currentIndex];

        const intermediateCalculation = previousOriginalValue + previousAdjustedValue - currentOriginalValue;
        
        adjustedValues[currentIndex] = Math.max(0, intermediateCalculation);
    }

    const finalSum = adjustedValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(finalSum);
}

calculateAdjustedSum(require("fs").readFileSync("/dev/stdin", "utf8"));
