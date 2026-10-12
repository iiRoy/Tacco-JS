const REFERENCE_YEAR = 2004;

const DAY_NAME_PREFIXES = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'];

const determineDayName = (monthInput, dayInput) => {
    const zeroIndexedMonth = monthInput - 1;
    const targetDateObject = new Date(REFERENCE_YEAR, zeroIndexedMonth, dayInput);
    const dayOfWeekIndex = targetDateObject.getDay();
    const dayPrefix = DAY_NAME_PREFIXES[dayOfWeekIndex];
    return dayPrefix + 'day';
};

const fileSystemModule = require("fs");

const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const inputLines = rawInputData.split('\n');

inputLines.some(function(currentLineContent) {
    const lineSegments = currentLineContent.split(' ');
    const monthValue = parseInt(lineSegments[0], 10);
    const dayValue = parseInt(lineSegments[1], 10);

    if (monthValue !== 0) {
        const computedDayName = determineDayName(monthValue, dayValue);
        console.log(computedDayName);
    }
    return false;
});
