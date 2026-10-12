function computeAggregateDivisorScore(upperBoundValue, thresholdValue) {
    let totalScore = 0;

    for (let currentNumber = upperBoundValue; currentNumber >= 4; --currentNumber) {
        let currentNumberScore = 0;
        const sqrtCurrentNumber = Math.floor(Math.sqrt(currentNumber));

        for (let potentialDivisor = 2; potentialDivisor <= sqrtCurrentNumber; ++potentialDivisor) {
            if (currentNumber % potentialDivisor === 0) {
                const complementaryDivisor = currentNumber / potentialDivisor;

                if (complementaryDivisor < 10) {
                    currentNumberScore += (complementaryDivisor * 10 + potentialDivisor < thresholdValue && potentialDivisor !== complementaryDivisor) ? 2 : 1;
                }
            }
        }
        totalScore += currentNumberScore;
    }
    return totalScore;
}

function ProcessInputAndOutput(rawInput) {
    const parts = rawInput.split(" ");
    const firstVal = parseInt(parts[0], 10);
    const secondVal = parseInt(parts[1], 10);

    const finalResult = computeAggregateDivisorScore(firstVal, secondVal);

    console.log('%d', finalResult);
}

ProcessInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
