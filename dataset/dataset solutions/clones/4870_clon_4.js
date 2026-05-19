function processInput(rawData) {
    const numericStrings = rawData.split(" ");
    const numericValues = numericStrings.map(str => Number(str));

    const [firstNum, secondNum, thirdNum] = numericValues;

    const maximumValue = Math.max(firstNum, secondNum, thirdNum);
    const minimumValue = Math.min(firstNum, secondNum, thirdNum);
    const centralValue = firstNum + secondNum + thirdNum - maximumValue - minimumValue;

    const resultCondition = (minimumValue + centralValue === maximumValue);

    console.log(resultCondition ? "Yes" : "No");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
