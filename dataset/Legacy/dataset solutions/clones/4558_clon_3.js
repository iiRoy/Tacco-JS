function processInputData(rawInputContent) {
    const MONTHS_GROUP_ONE_VALUES = [1, 3, 5, 7, 8, 12];
    const MONTHS_GROUP_TWO_VALUES = [4, 6, 9, 11];
    const RADIX_DECIMAL = 10;
    const SPECIAL_MONTH_VALUE = 2;

    const monthsGroupOne = new Set(MONTHS_GROUP_ONE_VALUES);
    const monthsGroupTwo = new Set(MONTHS_GROUP_TWO_VALUES);

    let finalOutcome;

    const parseNumericValue = (str) => parseInt(str, RADIX_DECIMAL);

    const inputLineParts = rawInputContent[0].split(" ");
    const valX = parseNumericValue(inputLineParts[0]);
    const valY = parseNumericValue(inputLineParts[1]);

    const isEitherSpecialMonth = (valX === SPECIAL_MONTH_VALUE || valY === SPECIAL_MONTH_VALUE);

    if (isEitherSpecialMonth) {
        finalOutcome = "No";
    } else {
        const areBothInGroupOne = monthsGroupOne.has(valX) && monthsGroupOne.has(valY);
        const areBothInGroupTwo = monthsGroupTwo.has(valX) && monthsGroupTwo.has(valY);

        if (areBothInGroupOne || areBothInGroupTwo) {
            finalOutcome = "Yes";
        } else {
            finalOutcome = "No";
        }
    }

    console.log('%s', finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
