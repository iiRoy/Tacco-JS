function ProcessInputAndCalculate(rawInputString) {
    const [startValue, endValue, stepDivisor] = rawInputString.split(" ").map(Number);

    const countResult = Math.floor(endValue / stepDivisor) - Math.floor((startValue - 1) / stepDivisor);

    console.log(countResult);
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
