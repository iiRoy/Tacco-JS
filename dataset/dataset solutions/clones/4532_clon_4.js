function Main(input) {
    const numericValues = input.match(/\d+/g).slice(1).map(Number);

    const categorySummary = numericValues.reduce((accumulator, currentNumber) => {
        const { fixedColorTypes, overflowItemCounter } = accumulator;

        if (currentNumber >= 0 && currentNumber < 3200) {
            const typeIndex = Math.floor(currentNumber / 400);
            fixedColorTypes.add(typeIndex);
        } else if (currentNumber >= 3200 && currentNumber <= 4800) {
            accumulator.overflowItemCounter++;
        }
        return accumulator;
    }, { fixedColorTypes: new Set(), overflowItemCounter: 0 });

    const distinctFixedColorCount = categorySummary.fixedColorTypes.size;
    const totalOverflowItems = categorySummary.overflowItemCounter;

    const minimumPossibleColors = distinctFixedColorCount;

    const maximumPossibleColors = Math.min(minimumPossibleColors + totalOverflowItems, 8);

    console.log('%d %d', minimumPossibleColors, maximumPossibleColors);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
