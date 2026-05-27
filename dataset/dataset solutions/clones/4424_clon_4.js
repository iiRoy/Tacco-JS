function ProcessInput(rawText) {
    const numericValues = (rawText.match(/\d+/g) || []).map(Number);

    const controlValue = numericValues[0];
    const dataSet = numericValues.slice(1);

    const computeGreatestCommonDivisor = (valA, valB) => {
        while (valB !== 0) {
            [valA, valB] = [valB, valA % valB];
        }
        return valA;
    };

    const determineOverallLeastCommonMultiple = (numbersCollection) => {
        if (numbersCollection.length === 0) {
            throw new TypeError("Reduce of empty array with no initial value");
        }

        let currentLcm = numbersCollection[0];
        for (let idx = 1; idx < numbersCollection.length; idx++) {
            const nextNum = numbersCollection[idx];
            const commonDivisor = computeGreatestCommonDivisor(currentLcm, nextNum);
            currentLcm = (currentLcm * nextNum) / commonDivisor;
        }
        return currentLcm;
    };

    return controlValue === 1
        ? (dataSet.length === 0 ? undefined : Math.max(...dataSet))
        : determineOverallLeastCommonMultiple(dataSet);
}

console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
