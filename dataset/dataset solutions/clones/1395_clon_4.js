const processInputValues = (incomingText) => {
    const extractedNumericParts = incomingText.match(/-?\d+/g);

    const firstVal = parseInt(extractedNumericParts[0], 10);
    const secondVal = parseInt(extractedNumericParts[1], 10);

    const divisionResult = firstVal / secondVal;

    // Custom implementation for integer division equivalent to Math.floor()
    let integerQuotient;
    if (divisionResult >= 0) {
        integerQuotient = Math.trunc(divisionResult);
    } else {
        integerQuotient = Math.trunc(divisionResult);
        if (integerQuotient !== divisionResult) {
            integerQuotient--;
        }
    }

    // Custom implementation for remainder equivalent to % operator
    const calculatedRemainder = firstVal - (integerQuotient * secondVal);

    // Formatting for precise result using Intl.NumberFormat instead of toFixed()
    const decimalPresenter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
        useGrouping: false
    });
    const formattedPreciseResult = decimalPresenter.format(divisionResult);

    // Output using template literals instead of printf-style
    console.log(`${integerQuotient} ${calculatedRemainder} ${formattedPreciseResult}`);
};

const rawDataPayload = require("node:fs").readFileSync("/dev/stdin", "utf8");
processInputValues(rawDataPayload);