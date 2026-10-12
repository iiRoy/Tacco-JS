function processInput(rawData) {
    const dataSegments = rawData.split("\n");
    const itemCount = Number.parseInt(dataSegments[0], 10);
    const numericValues = dataSegments[1].split(" ").map(valStr => Number.parseInt(valStr, 10));

    const countBinaryFactors = (value) => {
        let currentFactorCount = 0;
        let workingValue = value;
        while ((workingValue & 1) === 0 && workingValue !== 0) {
            workingValue >>= 1;
            currentFactorCount++;
        }
        return currentFactorCount;
    };

    const totalDivisions = numericValues.reduce((accumulatedCount, currentNum) => {
        return accumulatedCount + countBinaryFactors(currentNum);
    }, 0);

    console.log(totalDivisions);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
