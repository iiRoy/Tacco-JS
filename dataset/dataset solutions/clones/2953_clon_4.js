(function(dataArray) {
    const validMonths = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    const inputSequence = dataArray[0];
    const firstPartValue = parseInt(inputSequence.substring(0, 2), 10);
    const secondPartValue = parseInt(inputSequence.substring(2, 4), 10);

    const checkValidity = (value) => validMonths.has(value);

    const isFirstPartMonth = checkValidity(firstPartValue);
    const isSecondPartMonth = checkValidity(secondPartValue);

    const resultMatrix = {
        "true_true": "AMBIGUOUS",
        "false_true": "YYMM",
        "true_false": "MMYY",
        "false_false": "NA"
    };

    const decisionKey = `${isFirstPartMonth}_${isSecondPartMonth}`;
    return [resultMatrix[decisionKey]];
})