const processFinancialGoalCalculation = () => {
    const fileSystemModule = require('fs');
    const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    const numericValues = rawInputString.trim().split(" ").map(Number);

    const dailyContributionAmount = numericValues[0];
    const weeklyBonusAmount = numericValues[1];
    const targetAccumulation = numericValues[2];

    let totalDaysCount = 0;
    let currentWeekDayIndex = 0;
    let currentAccumulatedSum = 0;

    const DAYS_PER_CYCLE = 7;

    while (currentAccumulatedSum < targetAccumulation) {
        totalDaysCount++;
        currentWeekDayIndex++;
        currentAccumulatedSum += dailyContributionAmount;

        const isEndOfWeek = (currentWeekDayIndex === DAYS_PER_CYCLE);
        if (isEndOfWeek) {
            currentAccumulatedSum += weeklyBonusAmount;
            currentWeekDayIndex = 0;
        }
    }

    console.log(totalDaysCount);
};

processFinancialGoalCalculation();
