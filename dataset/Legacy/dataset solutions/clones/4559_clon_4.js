'use strict';

function processMonthComparison(rawInput) {
    const parsedValues = rawInput.split("\n")[0].split(" ");
    const firstMonth = parseInt(parsedValues[0], 10);
    const secondMonth = parseInt(parsedValues[1], 10);

    const monthsWithThirtyOneDays = [1, 3, 5, 7, 8, 10, 12];
    const monthsWithThirtyDays = [4, 6, 9, 11];

    const monthCharacteristicsMap = Array.from({ length: 12 }, (_, index) => index + 1).reduce((accumulator, currentMonthNumber) => {
        const isCurrentMonthFebruary = (currentMonthNumber === 2);
        const indexInThirtyOneDayGroup = monthsWithThirtyOneDays.indexOf(currentMonthNumber);
        const isInThirtyOneDayGroup = (indexInThirtyOneDayGroup >= 0);
        const indexInThirtyDayGroup = monthsWithThirtyDays.indexOf(currentMonthNumber);
        const isInThirtyDayGroup = (indexInThirtyDayGroup >= 0);

        accumulator[currentMonthNumber] = {
            isFebruary: isCurrentMonthFebruary,
            inGroupA: isInThirtyOneDayGroup,
            groupAIdx: indexInThirtyOneDayGroup,
            inGroupB: isInThirtyDayGroup,
            groupBIdx: indexInThirtyDayGroup
        };
        return accumulator;
    }, {});

    const dataForFirstMonth = monthCharacteristicsMap[firstMonth];
    const dataForSecondMonth = monthCharacteristicsMap[secondMonth];

    const februaryMatch = (dataForFirstMonth.isFebruary && dataForSecondMonth.isFebruary);
    const groupAMatch = (dataForFirstMonth.inGroupA && !!dataForSecondMonth.groupAIdx);
    const groupBMatch = (dataForFirstMonth.inGroupB && !!dataForSecondMonth.groupBIdx);

    if (februaryMatch || groupAMatch || groupBMatch) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processMonthComparison(require("fs").readFileSync("/dev/stdin", "utf8"));
