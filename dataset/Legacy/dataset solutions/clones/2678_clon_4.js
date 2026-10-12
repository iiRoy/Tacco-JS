function processInputData(rawData) {
    const numericalLimit = Number(rawData);
    let totalOddDigitCount = 0;
    let powerOfTenBase = 1;
    let digitLength = 1;

    while (powerOfTenBase < numericalLimit) {
        const nextPowerOfTenBase = powerOfTenBase * 10;
        const currentRangeUpperLimit = nextPowerOfTenBase - 1;

        const effectiveUpperLimit = Math.min(currentRangeUpperLimit, numericalLimit - 1);

        if (digitLength % 2 === 1) {
            if (effectiveUpperLimit >= powerOfTenBase) {
                totalOddDigitCount += (effectiveUpperLimit - powerOfTenBase + 1);
            }
        }

        powerOfTenBase = nextPowerOfTenBase;
        digitLength++;
    }

    console.log(totalOddDigitCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
