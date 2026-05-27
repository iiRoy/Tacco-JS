function obtainDigitSum(numValue) {
    const numStringRepresentation = String(numValue);
    let currentDigitTotal = 0;
    for (let digitChar of numStringRepresentation) {
        currentDigitTotal += Number(digitChar);
    }
    return currentDigitTotal;
}

function processData(dataLines) {
    const firstLineParts = dataLines[0].split(" ");
    const maxNumber = Number(firstLineParts[0]);
    const minDigitSum = Number(firstLineParts[1]);
    const maxDigitSum = Number(firstLineParts[2]);

    let resultAccumulator = 0;
    let currentNumber = 1;

    while (currentNumber <= maxNumber) {
        const calculatedDigitSum = obtainDigitSum(currentNumber);

        const meetsLowerBound = calculatedDigitSum >= minDigitSum;
        const meetsUpperBound = calculatedDigitSum <= maxDigitSum;

        if (meetsLowerBound && meetsUpperBound) {
            resultAccumulator += currentNumber;
        }
        currentNumber++;
    }
    console.log(resultAccumulator);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
