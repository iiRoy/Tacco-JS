function calculateSpecialValue(numericString) {
    const stringLength = numericString.length;
    
    const getLeadingDigitValue = (s) => parseInt(s.charAt(0));
    const getTrailingCharacter = (s) => s.slice(-1);

    const leadingDigit = getLeadingDigitValue(numericString);
    const trailingChar = getTrailingCharacter(numericString);
    
    let computedResult;

    const NINE_CONSTANT = 9;

    if (stringLength === 1) {
        computedResult = parseInt(numericString);
    } else {
        const isTwoDigitEndingInNine = (trailingChar === '9' && stringLength === 2);

        if (isTwoDigitEndingInNine) {
            computedResult = (stringLength - 1) * NINE_CONSTANT + leadingDigit;
        } else {
            const baseValueForCalculation = (stringLength - 1) * NINE_CONSTANT;
            computedResult = baseValueForCalculation + leadingDigit - 1;
        }
    }
    
    console.log(computedResult);
}

calculateSpecialValue(require("fs").readFileSync("/dev/stdin", "utf8"));
