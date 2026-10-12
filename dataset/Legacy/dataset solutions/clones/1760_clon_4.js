function findGreatestCommonDivisor(firstNumber, secondNumber) {
    while (secondNumber !== 0) {
        let remainderValue = firstNumber % secondNumber;
        firstNumber = secondNumber;
        secondNumber = remainderValue;
    }
    return firstNumber;
}

function processInputAndCompute(inputDataString) {
    const startingValue = parseInt(inputDataString.trim(), 10);
    const totalDegrees = 360;

    const commonFactor = findGreatestCommonDivisor(startingValue, totalDegrees);
    const minimumTurns = totalDegrees / commonFactor;

    process.stdout.write(minimumTurns.toString() + "\n");
}

const rawInputContent = process.stdin.readFileSync(0, "utf8");
processInputAndCompute(rawInputContent);