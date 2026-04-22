const performCalculations = (inputData) => {
    const numericModulus = 1000003;

    const parsedLines = inputData.trim().split('\n');
    const queryQuantity = Number(parsedLines.shift());

    const parameterSets = parsedLines.map(rowText => rowText.split(' ').map(Number));

    parameterSets.forEach(([firstVal, stepSize, repeatCount]) => {
        if (repeatCount === 0) {
            console.log(0);
            return;
        }

        const seriesTerms = Array.from({ length: repeatCount }, (_, idx) => firstVal + idx * stepSize);

        const computedProduct = seriesTerms.reduce((accumulatedValue, currentFactor) => {
            const adjustedFactor = (currentFactor % numericModulus + numericModulus) % numericModulus;
            return (accumulatedValue * adjustedFactor) % numericModulus;
        }, 1);

        console.log(computedProduct);
    });
};

performCalculations(require("fs").readFileSync("/dev/stdin", "utf8"));