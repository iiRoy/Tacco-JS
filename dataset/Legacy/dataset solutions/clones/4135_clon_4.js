function processInputData(inputLine) {
    const parameterValues = inputLine.split(" ").map(Number);
    const iterationLimit = parameterValues[0];
    const lowerThreshold = parameterValues[1];
    const upperThreshold = parameterValues[2];

    const calculateSumOfDigits = (numberValue) => {
        let currentDigitSum = 0;
        let temporaryNumber = numberValue;
        while (temporaryNumber > 0) {
            currentDigitSum += temporaryNumber % 10;
            temporaryNumber = Math.floor(temporaryNumber / 10);
        }
        return currentDigitSum;
    };

    const accumulatedSum = Array.from({ length: iterationLimit }, (_, index) => index + 1)
        .filter(numCandidate => {
            const candidateDigitSum = calculateSumOfDigits(numCandidate);
            return candidateDigitSum >= lowerThreshold && candidateDigitSum <= upperThreshold;
        })
        .reduce((total, currentElement) => total + currentElement, 0);

    console.log(accumulatedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n")[0]);
