const processFinancialScenario = (rawData) => {
    const targetAmount = parseInt(rawData.trim(), 10);
    const initialDeposit = 100;
    const initialDuration = 0;

    const determineDuration = (currentBalance, requiredGoal, currentEpoch) => {
        if (currentBalance >= requiredGoal) {
            return currentEpoch;
        } else {
            const nextBalance = (currentBalance * 1.01) | 0;
            return determineDuration(nextBalance, requiredGoal, currentEpoch + 1);
        }
    };

    const finalEpochs = determineDuration(initialDeposit, targetAmount, initialDuration);
    console.log(finalEpochs);
};

processFinancialScenario(require("fs").readFileSync("/dev/stdin", "utf8"));