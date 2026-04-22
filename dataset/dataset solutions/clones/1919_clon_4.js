const processInputAndCompute = (dataSet) => {
    const desiredBenchmark = Number(dataSet[0]);

    const determineGrowthPeriods = (currentBalance, passedUnits) => {
        if (currentBalance >= desiredBenchmark) {
            return passedUnits;
        } else {
            const nextBalance = Math.floor(currentBalance * 1.01);
            return determineGrowthPeriods(nextBalance, passedUnits + 1);
        }
    };

    const initialValue = 100;
    const startingCount = 0;
    const finalResult = determineGrowthPeriods(initialValue, startingCount);
    console.log(finalResult);
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));