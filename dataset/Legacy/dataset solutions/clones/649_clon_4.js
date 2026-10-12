const inputValues = require('fs').readFileSync('/dev/stdin', 'utf8').split(' ').map(Number);
const [dailyIncrement, weeklyBonus, targetAmount] = inputValues;

const calculateAccumulation = (dayCount) => {
    return dayCount * dailyIncrement + Math.floor(dayCount / 7) * weeklyBonus;
};

if (dailyIncrement >= targetAmount) {
    console.log(1);
} else {
    let searchLower = 1;
    let searchUpper = targetAmount * 2 + 7;
    let finalDayCount = searchUpper;

    while (searchLower <= searchUpper) {
        const currentMidpoint = Math.floor((searchLower + searchUpper) / 2);
        const currentTotal = calculateAccumulation(currentMidpoint);

        if (currentTotal >= targetAmount) {
            finalDayCount = currentMidpoint;
            searchUpper = currentMidpoint - 1;
        } else {
            searchLower = currentMidpoint + 1;
        }
    }
    console.log(finalDayCount);
}
