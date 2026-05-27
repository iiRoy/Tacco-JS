function processInputAndCompute(sourceText) {
    const numericLimit = Number.parseInt(sourceText.split('\n')[0], 10);
    let accumulatedSum = 0;

    for (let firstFactor = 1; firstFactor <= numericLimit; firstFactor++) {
        const validSecondFactorCount = Math.floor((numericLimit - 1) / firstFactor);
        accumulatedSum += validSecondFactorCount;
    }

    console.log(accumulatedSum);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
