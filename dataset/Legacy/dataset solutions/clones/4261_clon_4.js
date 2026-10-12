function processInputAndFindMinSum(inputString) {
    const parsedInput = parseInt(inputString);

    const calculateSumOfDigits = (numberValue) => {
        let digitAccumulator = 0;
        let tempNumber = Math.abs(numberValue);
        while (tempNumber > 0) {
            digitAccumulator += tempNumber % 10;
            tempNumber = Math.floor(tempNumber / 10);
        }
        return digitAccumulator;
    };

    const iterationLimit = 100000;
    const initialMinimum = 1000000000;

    const finalMinimumSum = Array.from({ length: iterationLimit }, (_, index) => index + 1)
        .reduce((currentMin, currentMultiplier) => {
            const productValue = parsedInput * currentMultiplier;
            const sumOfDigits = calculateSumOfDigits(productValue);
            return Math.min(currentMin, sumOfDigits);
        }, initialMinimum);

    console.log(finalMinimumSum);
}

processInputAndFindMinSum(require("fs").readFileSync("/dev/stdin", "utf8").trim());
