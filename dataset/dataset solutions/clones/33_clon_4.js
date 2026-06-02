function getBinomialCoefficient(upperValue, lowerValue) {
    if (lowerValue < 0 || lowerValue > upperValue) {
        return 0;
    }
    if (lowerValue === 0 || lowerValue === upperValue) {
        return 1;
    }
    if (lowerValue > upperValue / 2) {
        lowerValue = upperValue - lowerValue;
    }

    let currentResult = 1;
    for (let i = 0; i < lowerValue; i++) {
        currentResult = currentResult * (upperValue - i) / (i + 1);
    }
    return currentResult;
}

function calculateSumCombinations(targetValue) {
    const termOneCoefficient = 1; // C(4,0)
    const termTwoCoefficient = 4; // C(4,1)
    const termThreeCoefficient = 6; // C(4,2)
    const termFourCoefficient = 4; // C(4,3)
    const termFiveCoefficient = 1; // C(4,4)

    let finalCount = 0;

    finalCount += termOneCoefficient * getBinomialCoefficient(targetValue + 3, 3);

    if (targetValue >= 10) {
        finalCount -= termTwoCoefficient * getBinomialCoefficient(targetValue - 10 + 3, 3);
    }

    if (targetValue >= 20) {
        finalCount += termThreeCoefficient * getBinomialCoefficient(targetValue - 20 + 3, 3);
    }

    if (targetValue >= 30) {
        finalCount -= termFourCoefficient * getBinomialCoefficient(targetValue - 30 + 3, 3);
    }

    if (targetValue >= 40) {
        finalCount += termFiveCoefficient * getBinomialCoefficient(targetValue - 40 + 3, 3);
    }

    return finalCount;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on("data", function(receivedData) {
    const dataLines = String(receivedData).trim().split("\n");
    const parsedNumbers = dataLines.map(lineText => parseInt(lineText, 10));

    parsedNumbers.forEach(currentNumber => {
        const combinationsResult = calculateSumCombinations(currentNumber);
        console.log(combinationsResult);
    });
});
