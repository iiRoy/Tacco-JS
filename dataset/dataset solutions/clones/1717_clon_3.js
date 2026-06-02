function processAndCalculate(inputStringData) {
    let computedResult = 0;

    const linesOfInput = inputStringData.trim().split("\n");

    const baseValue = parseInt(linesOfInput[0], 10);

    const calculatePower = (base, exponent) => {
        let currentPower = 1;
        for (let k = 0; k < exponent; k++) {
            currentPower *= base;
        }
        return currentPower;
    };

    const firstPowerTerm = calculatePower(baseValue, 1);
    const secondPowerTerm = calculatePower(baseValue, 2);
    const thirdPowerTerm = calculatePower(baseValue, 3);

    computedResult = firstPowerTerm + secondPowerTerm + thirdPowerTerm;

    console.log(computedResult);
}

processAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
