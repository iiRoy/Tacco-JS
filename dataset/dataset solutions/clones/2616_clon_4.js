function performCalculation(inputData) {
    const inputParts = inputData.trim().split(" ");
    const finalMonth = parseInt(inputParts[0], 10);
    const finalDay = parseInt(inputParts[1], 10);

    const obtainProductOfDigits = (numberValue) => {
        const singleDigit = numberValue % 10;
        const doubleDigit = Math.floor(numberValue / 10);
        return singleDigit * doubleDigit;
    };

    const possibleMonths = Array.from({ length: Math.max(0, finalMonth - 4 + 1) }, (_, idx) => 4 + idx);

    const matchingPairsCount = possibleMonths.flatMap(currentMonthValue => {
        const dayRangeLength = Math.max(0, finalDay - 22 + 1);
        const daysForCurrentMonth = Array.from({ length: dayRangeLength }, (_, dayIdx) => 22 + dayIdx);

        return daysForCurrentMonth.filter(currentDayValue => {
            return currentMonthValue === obtainProductOfDigits(currentDayValue);
        });
    }).length;

    console.log(matchingPairsCount);
}

performCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
