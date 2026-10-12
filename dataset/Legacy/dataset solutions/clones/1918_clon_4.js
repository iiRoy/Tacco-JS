const processInputAndCalculate = (inputData) => {
    const targetValue = Number(inputData);

    const computeYearsToReachGoal = (currentBalance, elapsedYears, goalValue) => {
        if (currentBalance >= goalValue) {
            return elapsedYears;
        } else {
            const nextBalance = Math.floor(currentBalance * 1.01);
            return computeYearsToReachGoal(nextBalance, elapsedYears + 1, goalValue);
        }
    };

    const resultYears = computeYearsToReachGoal(100, 0, targetValue);

    console.log(resultYears);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
