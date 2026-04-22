let inputString = require('node:fs').readFileSync('/dev/stdin', 'utf8');
let numberStrings = inputString.trim().split(" ");
let [initialRate, bonusRate, targetAmount] = numberStrings.map(Number);

const determineAccumulatedValue = (dayIndex, baseIncrement, periodicBonus) => {
    let baseTotal = dayIndex * baseIncrement;
    let bonusPeriods = Math.floor(dayIndex / 7);
    let bonusTotal = bonusPeriods * periodicBonus;
    return baseTotal + bonusTotal;
};

let lowerBound = 1;
let upperBound = 2 * 10**9; // A sufficiently large upper bound for the number of days
let finalDayCount = upperBound;

while (lowerBound <= upperBound) {
    let midPointDay = Math.floor((lowerBound + upperBound) / 2);
    let currentTotal = determineAccumulatedValue(midPointDay, initialRate, bonusRate);

    if (currentTotal >= targetAmount) {
        finalDayCount = midPointDay;
        upperBound = midPointDay - 1; 
    } else {
        lowerBound = midPointDay + 1;
    }
}

console.log(finalDayCount);