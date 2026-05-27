function processInputData(rawInputString) {
    const trimmedString = rawInputString.trim();
    const stringParts = trimmedString.split(' ');
    const numericValues = stringParts.map(part => parseInt(part, 10));

    const firstVal = numericValues[0];
    const secondVal = numericValues[1];
    const thirdVal = numericValues[2];
    const limitVal = numericValues[3];

    const getAbsoluteValueFromBoolean = (expressionResult) => Math.abs(expressionResult);

    const firstComparisonResult = (firstVal - thirdVal <= limitVal);
    const secondComparisonResultA = (firstVal - secondVal <= limitVal);
    const secondComparisonResultB = (secondVal - thirdVal <= limitVal);

    const absFirstCondition = getAbsoluteValueFromBoolean(firstComparisonResult);
    const absSecondConditionA = getAbsoluteValueFromBoolean(secondComparisonResultA);
    const absSecondConditionB = getAbsoluteValueFromBoolean(secondComparisonResultB);

    const finalDecisionCondition = absFirstCondition || (absSecondConditionA && absSecondConditionB);

    if (finalDecisionCondition) {
        const thirdValLessThanLimit = (thirdVal <= limitVal);
        const outputValue = getAbsoluteValueFromBoolean(thirdValLessThanLimit);
        console.log(outputValue);
    } else {
        console.log('No');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
