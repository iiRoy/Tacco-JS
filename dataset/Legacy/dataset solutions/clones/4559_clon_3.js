'use strict';

function extractMonthNumbers(rawInputContent) {
    const firstLine = rawInputContent.split("\n")[0];
    const monthStrings = firstLine.split(" ");
    const monthOne = parseInt(monthStrings[0], 10);
    const monthTwo = parseInt(monthStrings[1], 10);
    return { monthOne, monthTwo };
}

function processInput(rawInputString) {
    const monthData = extractMonthNumbers(rawInputString);
    const firstMonth = monthData.monthOne;
    const secondMonth = monthData.monthTwo;

    const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
    const monthsWith30Days = [4, 6, 9, 11];

    const getMonthGroupIndex = (monthValue, groupArray) => groupArray.indexOf(monthValue);

    const areBothFebruary = (firstMonth === 2 && secondMonth === 2);

    const firstMonthIndexIn31 = getMonthGroupIndex(firstMonth, monthsWith31Days);
    const secondMonthIndexIn31 = getMonthGroupIndex(secondMonth, monthsWith31Days);
    const areBothIn31DayGroup = (firstMonthIndexIn31 >= 0 && secondMonthIndexIn31);

    const firstMonthIndexIn30 = getMonthGroupIndex(firstMonth, monthsWith30Days);
    const secondMonthIndexIn30 = getMonthGroupIndex(secondMonth, monthsWith30Days);
    const areBothIn30DayGroup = (firstMonthIndexIn30 >= 0 && secondMonthIndexIn30);

    if (areBothFebruary || areBothIn31DayGroup || areBothIn30DayGroup) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
