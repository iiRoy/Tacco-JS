function processInputData(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const stringNumbers = trimmedInput.split(' ');
    const numericValues = stringNumbers.map(strNum => parseInt(strNum, 10));

    const [firstVal, secondVal, thirdVal, thresholdVal] = numericValues;

    // The original condition was: (Math.abs(a-b <=d)) || (Math.abs(a-b <=d) && Math.abs(b-c <=d))
    // Let X = Math.abs(a-b <=d) and Y = Math.abs(b-c <=d).
    // The condition is X || (X && Y).
    // This logical expression is equivalent to X.
    // Therefore, the second part of the original OR condition (X && Y) is redundant.
    // We introduce a helper variable for the essential part of the condition.
    // This preserves the original's unique Math.abs(boolean) behavior.
    const isPrimaryConditionMet = Math.abs((firstVal - secondVal) <= thresholdVal);

    if (isPrimaryConditionMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
