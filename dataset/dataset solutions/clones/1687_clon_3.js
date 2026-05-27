function calculateRemaining(rawInputString) {
    const thousandUnit = 1000;
    let initialAmount = parseInt(rawInputString, 10);

    const findNextMultiple = (currentAmount, unitStep) => {
        let currentMultiple = unitStep;
        while (currentMultiple <= currentAmount) {
            currentMultiple += unitStep;
        }
        return currentMultiple;
    };

    let nextThousandMultiple = findNextMultiple(initialAmount, thousandUnit);

    console.log(nextThousandMultiple - initialAmount);
}

calculateRemaining(require("fs").readFileSync("/dev/stdin", "utf8"));
