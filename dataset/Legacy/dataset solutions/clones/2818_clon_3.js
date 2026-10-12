function processInputData(rawData) {
    const DELIMITER_CHAR = ' ';
    var inputTokens = rawData.split(DELIMITER_CHAR);

    var parsedNumbers = inputTokens.map(tokenString => parseInt(tokenString, 10));

    const primaryValue = parsedNumbers[0];
    const secondaryValue = parsedNumbers[1];

    const evaluateConditionAndOutput = (valA, valB) => {
        const isFirstValueSmaller = valA < valB;
        if (isFirstValueSmaller) {
            return 0;
        } else {
            return 10;
        }
    };

    console.log(evaluateConditionAndOutput(primaryValue, secondaryValue));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
