const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = fileContent.split("\n");

const nonLeapMonthDurations = [0, 20, 19, 20, 19, 20, 19, 20, 19, 20, 19];

const retrieveMonthDuration = (currentYear, currentMonth) => {
    if (currentYear % 3 === 0) {
        return 20;
    }
    return nonLeapMonthDurations[currentMonth];
};

const computeAbsoluteDayIndex = (targetYear, targetMonth, targetDay) => {
    let totalAccumulatedDays = 0;

    for (let yrIterator = 1; yrIterator < targetYear; yrIterator++) {
        totalAccumulatedDays += (yrIterator % 3 === 0) ? 200 : 195;
    }

    for (let mnIterator = 1; mnIterator < targetMonth; mnIterator++) {
        totalAccumulatedDays += retrieveMonthDuration(targetYear, mnIterator);
    }

    totalAccumulatedDays += targetDay;

    return totalAccumulatedDays;
};

const absoluteTargetDay = computeAbsoluteDayIndex(1000, 1, 1);

dataRows.shift();

dataRows.forEach(rowText => {
    const [parsedYear, parsedMonth, parsedDay] = rowText.trim().split(' ').map(Number);

    const absoluteInputDay = computeAbsoluteDayIndex(parsedYear, parsedMonth, parsedDay);

    const dayCount = absoluteTargetDay - absoluteInputDay;

    console.log(dayCount);
});
