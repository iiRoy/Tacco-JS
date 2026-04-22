const processInputValues = () => {
    const rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const [alpha, beta, gamma] = rawDataContent.split(' ').map(Number);
    return { dailyIncrement: alpha, weeklyBonus: beta, requiredTotal: gamma };
};

const evaluateAccumulation = (dayCount, dailyRate, bonusRate) => {
    return dayCount * dailyRate + Math.floor(dayCount / 7) * bonusRate;
};

const determineTargetDay = (dailyIncrement, weeklyBonus, requiredTotal) => {
    let lowerLimit = 1;
    // A sufficiently large upper bound for the number of days.
    // Max requiredTotal (C) is 10^9. If dailyIncrement (A) is 1 and weeklyBonus (B) is 0,
    // it takes 10^9 days. So 2 * 10^9 is a safe upper limit for binary search.
    let upperLimit = 2 * 1000000000;
    let ultimateAnswer = upperLimit; // Initialize with a value that will be overwritten.

    while (lowerLimit <= upperLimit) {
        const probeDay = lowerLimit + Math.floor((upperLimit - lowerLimit) / 2);
        const accumulatedAtProbeDay = evaluateAccumulation(probeDay, dailyIncrement, weeklyBonus);

        if (accumulatedAtProbeDay >= requiredTotal) {
            ultimateAnswer = probeDay;
            upperLimit = probeDay - 1; // Attempt to find an earlier day
        } else if (accumulatedAtProbeDay + dailyIncrement >= requiredTotal) {
            // Target not met precisely on probeDay, but would be met on probeDay + 1
            // by just the daily increment (without considering potential weekly bonus on probeDay + 1).
            ultimateAnswer = probeDay + 1;
            upperLimit = probeDay - 1; // Check if an even earlier 'probeDay' could still lead to 'probeDay + 1' being the minimal answer
        } else {
            lowerLimit = probeDay + 1; // Accumulation is insufficient, need to check later days
        }
    }
    return ultimateAnswer;
};

const { dailyIncrement, weeklyBonus, requiredTotal } = processInputValues();
const finalOutcome = determineTargetDay(dailyIncrement, weeklyBonus, requiredTotal);
console.log(finalOutcome);