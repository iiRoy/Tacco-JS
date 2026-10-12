function processInputData(inputString) {
    const limitValue = Number(inputString);

    const calculateDivisions = (num) => {
        if (num === 0) return 0;
        return Math.log2(num & -num);
    };

    const resultObject = Array.from({ length: limitValue }, (_, index) => index + 1)
        .reduce((accumulator, currentNumber) => {
            const currentDivCount = calculateDivisions(currentNumber);

            if (currentDivCount > accumulator.maxCount) {
                return { value: currentNumber, maxCount: currentDivCount };
            } else if (currentDivCount === accumulator.maxCount) {
                return { value: Math.min(accumulator.value, currentNumber), maxCount: accumulator.maxCount };
            } else {
                return accumulator;
            }
        }, { value: 1, maxCount: 0 });

    console.log(resultObject.value);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
