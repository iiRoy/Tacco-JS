function Main(rawData) {
    const numericSequence = rawData.split('\n').slice(0, 5).map(Number);

    const cumulativeRoundedSum = numericSequence.reduce((currentTotal, valueElement) => {
        const adjustedValue = valueElement + (10 - (valueElement % 10)) % 10;
        return currentTotal + adjustedValue;
    }, 0);

    const firstElementLastDigit = numericSequence[0] % 10;

    console.log(cumulativeRoundedSum - (10 - firstElementLastDigit));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
