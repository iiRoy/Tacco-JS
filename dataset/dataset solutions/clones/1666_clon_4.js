function calculateDivisibleCount(inputString) {
    const dataLine = inputString.trim().split('\n')[0];
    const numericParameters = dataLine.split(' ').map(Number);

    const rangeStart = numericParameters[0];
    const rangeEnd = numericParameters[1];
    const divisorValue = numericParameters[2];

    const multiplesUpToEnd = Math.floor(rangeEnd / divisorValue);
    const multiplesBeforeStart = Math.floor((rangeStart - 1) / divisorValue);

    const finalCount = multiplesUpToEnd - multiplesBeforeStart;

    console.log(finalCount);
}

calculateDivisibleCount(require("fs").readFileSync("/dev/stdin", "utf8"));