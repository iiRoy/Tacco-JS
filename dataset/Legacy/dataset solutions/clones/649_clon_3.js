const processInputData = () => {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const numericValues = rawInput.split(' ').map(Number);
    // Destructure into more descriptive variable names
    const [baseIncrement, bonusIncrement, targetThreshold] = numericValues;
    return { baseIncrement, bonusIncrement, targetThreshold };
};

const determineCompletionDays = () => {
    const { baseIncrement: dailyGain, bonusIncrement: weeklyBonus, targetThreshold: requiredTotal } = processInputData();

    // Handle the edge case where the initial daily gain already meets or exceeds the target
    if (dailyGain >= requiredTotal) {
        console.log(1);
        return;
    }

    let accumulatedValue = 0;
    let currentDay = 0;
    const WEEKLY_CYCLE_LENGTH = 7; // Define a constant for the magic number 7

    // Use an infinite loop and manage breaks explicitly for clarity
    while (true) {
        currentDay++; // Increment day count at the start of each iteration
        accumulatedValue += dailyGain; // Add the base daily gain

        // Apply bonus on specific days
        if (currentDay % WEEKLY_CYCLE_LENGTH === 0) {
            accumulatedValue += weeklyBonus;
        }

        // Check if the target has been reached or exceeded on the current day
        if (accumulatedValue >= requiredTotal) {
            console.log(currentDay);
            break; // Exit loop, target met
        }

        // Check if the target will be met on the *next* day with just the base daily gain
        // This means the current accumulatedValue is less than requiredTotal,
        // but adding dailyGain would push it over.
        if (requiredTotal - accumulatedValue < dailyGain) {
            console.log(currentDay + 1);
            break; // Exit loop, target will be met next day
        }
    }
};

determineCompletionDays();
