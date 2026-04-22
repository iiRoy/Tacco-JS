((inputContent) => {
    const numericElements = inputContent
        .trim()
        .split(/\s+/)
        .map(Number);

    const result = numericElements.reduce((accumulator, currentDatum, index) => {
        if (index === 0) {
            accumulator.factorA = currentDatum;
        } else if (index === 1) {
            accumulator.factorB = currentDatum;
        } else if (index === 2) {
            accumulator.thresholdValue = currentDatum;
            const computedProduct = accumulator.factorA * accumulator.factorB;
            accumulator.finalOutcome = (computedProduct < accumulator.thresholdValue) ? computedProduct : accumulator.thresholdValue;
        }
        return accumulator;
    }, { factorA: 0, factorB: 0, thresholdValue: 0, finalOutcome: 0 });

    console.log(result.finalOutcome);
})(require("fs").readFileSync("/dev/stdin", "utf8"));