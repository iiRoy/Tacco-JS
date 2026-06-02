const rawData = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim();

const dataRows = rawData.trim().split("\n");

const advanceDate = (currentYear, currentMonth, currentDay) => {
    currentDay = currentDay + 1;

    if (currentYear % 3 === 0) {
        if (currentDay > 20) {
            currentDay = 1;
            currentMonth += 1;
            if (currentMonth === 11) {
                currentMonth = 1;
                currentYear++;
            }
        }
    } else {
        if (currentDay > 20) {
            currentDay = 1;
            currentMonth += 1;
            if (currentMonth === 11) {
                currentMonth = 1;
                currentYear++;
            }
        } else if (currentDay > 19 && currentMonth % 2 === 0) {
            currentDay = 1;
            currentMonth += 1;
            if (currentMonth === 11) {
                currentMonth = 1;
                currentYear++;
            }
        }
    }
    return [currentYear, currentMonth, currentDay];
};

dataRows.shift();

dataRows.forEach(dataLine => {
    let [currentYear, currentMonth, currentDay] = dataLine.trim().split(' ').map(Number);
    let dayCounter = 1;

    while (currentYear !== 1000 || currentMonth !== 1 || currentDay !== 1) {
        [currentYear, currentMonth, currentDay] = advanceDate(currentYear, currentMonth, currentDay);
        dayCounter++;
    }

    console.log(dayCounter - 1);
});
