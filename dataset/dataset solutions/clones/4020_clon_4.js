const sumDigits = (numVal) => {
    let totalSum = 0;
    let tempNum = Math.abs(numVal);
    while (tempNum > 0) {
        totalSum += tempNum % 10;
        tempNum = Math.floor(tempNum / 10);
    }
    return totalSum;
};

const executeComputation = (rawInput) => {
    const limitValue = Number(rawInput);

    const peakValue = Array.from({ length: limitValue }, (_, currentNum) => currentNum)
                            .map(sumDigits)
                            .reduce((acc, currentSum) => Math.max(acc, currentSum), 0);

    console.log(peakValue);
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));
