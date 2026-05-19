function processData(rawInput) {
    const inputLines = rawInput.split('\n');

    const lineCount = Number(inputLines[0]); // Original 'n', unused in logic
    const primaryValues = inputLines[1].split(' ').map(Number); // Original 'a'
    const secondaryValues = inputLines[2].split(' ').map(Number); // Original 'b'

    let totalPrimary = 0;
    for (const val of primaryValues) {
        totalPrimary += val;
    }

    let totalSecondary = 0;
    for (const val of secondaryValues) {
        totalSecondary += val;
    }

    const requiredModifications = primaryValues.reduce((accumulatedValue, currentPrimary, idx) => {
        const currentSecondary = secondaryValues[idx];
        const delta = currentSecondary - currentPrimary;
        return accumulatedValue + Math.ceil(Math.max(delta, 0) / 2);
    }, 0);

    console.log(requiredModifications <= totalSecondary - totalPrimary ? "Yes" : "No");
}

processData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
