function processInputData(rawInputString) {
    const [firstConfigLine, numberSequenceLine] = rawInputString.split("\n");

    const [_, requiredParity] = firstConfigLine.split(" ").map(Number);
    const numericValues = numberSequenceLine.split(" ").map(Number);

    const { evenCount, oddCount } = numericValues.reduce((accumulator, currentNumber) => {
        if (currentNumber % 2 === 0) {
            accumulator.evenCount++;
        } else {
            accumulator.oddCount++;
        }
        return accumulator;
    }, { evenCount: 0, oddCount: 0 });

    const allEvenSubsets = Math.pow(2, evenCount);

    let conditionalOddSubsets;
    if (oddCount === 0) {
        conditionalOddSubsets = (requiredParity === 0) ? 1 : 0;
    } else {
        conditionalOddSubsets = Math.pow(2, oddCount - 1);
    }

    console.log(allEvenSubsets * conditionalOddSubsets);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
