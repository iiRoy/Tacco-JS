function ProcessAndDisplaySum(rawInputString) {
    const digitArray = Array.from(rawInputString, Number);

    const initialSumValue = 0;

    const calculatedSum = digitArray.reduce((accumulator, singleDigit) => {
        return accumulator + singleDigit;
    }, initialSumValue);

    console.log(calculatedSum);
}

ProcessAndDisplaySum(require("fs").readFileSync("/dev/stdin", "utf8").trim());
