function Main(rawInput) {
    const numericValues = rawInput.split(" ").map(Number);
    const [valA, valB, valC] = numericValues;

    const initialProduct = valB * valC;

    const determineComplexOutcome = (a, b, c) => {
        const rValue = Math.round(a / c);
        const isParityMatched = (rValue % 2 === b % 2);
        const isDifferenceNegative = (a - b * rValue < 0);

        const outcomeDispatch = {
            'true': () => Math.abs(a - b * rValue),
            'false_true': () => Math.abs(a - c * (rValue + 1)),
            'false_false': () => Math.abs(a - c * (rValue - 1))
        };

        const selectionKey = isParityMatched ? 'true' : `false_${isDifferenceNegative}`;
        return outcomeDispatch[selectionKey]();
    };

    const finalComputedValue = (valA > initialProduct)
        ? (valA - initialProduct)
        : determineComplexOutcome(valA, valB, valC);

    console.log(finalComputedValue);
}

Main(`10 4 3`);
//Main(require("fs").readFileSync("/dev/stdin", "utf8"));
