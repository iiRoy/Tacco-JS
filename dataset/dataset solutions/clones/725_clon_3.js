const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = rawData.split("\n");

const advanceMonthAndYear = (yearVal, monthVal) => {
    monthVal++;
    if (monthVal === 11) {
        monthVal = 1;
        yearVal++;
    }
    return [yearVal, monthVal];
};

const calculateNextDay = (currentYear, currentMonth, currentDay) => {
    currentDay++;

    let maxDaysInCurrentMonth;
    const isYearDivisibleByThree = (currentYear % 3 === 0);

    if (isYearDivisibleByThree) {
        maxDaysInCurrentMonth = 20;
    } else {
        const isMonthOdd = (currentMonth % 2 !== 0);
        if (isMonthOdd) {
            maxDaysInCurrentMonth = 20;
        } else {
            maxDaysInCurrentMonth = 19;
        }
    }

    if (currentDay > maxDaysInCurrentMonth) {
        currentDay = 1;
        const [nextYearValue, nextMonthValue] = advanceMonthAndYear(currentYear, currentMonth);
        currentYear = nextYearValue;
        currentMonth = nextMonthValue;
    }

    return [currentYear, currentMonth, currentDay];
};

dataRows.shift();

dataRows.forEach(inputLine => {
    let [initialYear, initialMonth, initialDay] = inputLine.trim().split(' ').map(Number);
    let dayCounter = 1;

    while (initialYear !== 1000 || initialMonth !== 1 || initialDay !== 1) {
        [initialYear, initialMonth, initialDay] = calculateNextDay(initialYear, initialMonth, initialDay);
        dayCounter++;
    }
    console.log(dayCounter - 1);
});
