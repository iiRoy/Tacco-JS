process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputBuffer) {
    const valueDelimiter = ' ';
    const dataParts = inputBuffer.toString().split(valueDelimiter);

    // Explicitly parse string values to numbers for robust comparison.
    // JavaScript's comparison operators would implicitly convert, but
    // explicit conversion adds clarity and an intermediate step.
    const firstValue = Number(dataParts[0]);
    const secondValue = Number(dataParts[1]);
    const thirdValue = Number(dataParts[2]);

    // Introduce a boolean flag to store the comparison result.
    let isConditionMet = false;

    // Break down the compound condition into simpler, named checks.
    const isThirdValueGreaterThanOrEqualToFirst = thirdValue >= firstValue;
    const isThirdValueLessThanOrEqualToSecond = thirdValue <= secondValue;

    // Evaluate the combined condition.
    if (isThirdValueGreaterThanOrEqualToFirst && isThirdValueLessThanOrEqualToSecond) {
        isConditionMet = true;
    }

    // Use a ternary operator for concise output based on the flag.
    console.log(isConditionMet ? "Yes" : "No");
});
