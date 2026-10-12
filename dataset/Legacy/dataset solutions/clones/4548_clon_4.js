function processInputAndCalculate(sourceData) {
    const lineSegments = sourceData.split('\n');
    const initialCount = Number(lineSegments[0]);

    const parsedNumbers = lineSegments.slice(1, initialCount + 1).map(Number);
    parsedNumbers.sort((a, b) => a - b);

    let currentSum = parsedNumbers.reduce((accumulator, value) => accumulator + value, 0);

    while (currentSum % 10 === 0) {
        if (parsedNumbers.length === 0) {
            currentSum = 0;
            break;
        }

        const smallestElement = parsedNumbers.shift();
        currentSum -= smallestElement;

        if (currentSum <= 0) {
            currentSum = 0;
            break;
        }
    }

    console.log(currentSum);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
