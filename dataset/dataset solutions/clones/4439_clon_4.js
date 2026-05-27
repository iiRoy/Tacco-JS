function main(inputContent) {
    const processedLines = inputContent.split('\n').map(line => line.trim());

    const totalCount = parseInt(processedLines[0], 10);
    const numberValues = processedLines[1].split(' ').map(Number);

    const { fours, odds } = numberValues.reduce((accumulator, currentNumber) => {
        if (currentNumber % 4 === 0) {
            accumulator.fours++;
        } else if (currentNumber % 2 !== 0) {
            accumulator.odds++;
        }
        return accumulator;
    }, { fours: 0, odds: 0 });

    const halfTotal = totalCount / 2;

    const finalOutcome = (halfTotal < odds)
        ? (fours >= odds - 1 ? "Yes" : "No")
        : (fours >= odds ? "Yes" : "no");

    console.log(finalOutcome);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
