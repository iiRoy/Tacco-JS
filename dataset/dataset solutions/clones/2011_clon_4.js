function retrieveKthRunRun(ordinalPosition) {
    if (ordinalPosition <= 9) {
        return ordinalPosition;
    }

    const numberQueue = [];
    for (let currentDigit = 1; currentDigit <= 9; currentDigit++) {
        numberQueue.push(currentDigit);
    }

    let discoveredCount = 9;
    let finalValue = 0;

    while (numberQueue.length > 0 && discoveredCount < ordinalPosition) {
        const currentCandidate = numberQueue.shift();
        finalValue = currentCandidate;

        const lastDigitOfCandidate = currentCandidate % 10;

        if (lastDigitOfCandidate > 0) {
            const nextGeneratedNumber = currentCandidate * 10 + (lastDigitOfCandidate - 1);
            numberQueue.push(nextGeneratedNumber);
            discoveredCount++;
            if (discoveredCount === ordinalPosition) {
                return nextGeneratedNumber;
            }
        }

        const nextGeneratedNumberSame = currentCandidate * 10 + lastDigitOfCandidate;
        numberQueue.push(nextGeneratedNumberSame);
        discoveredCount++;
        if (discoveredCount === ordinalPosition) {
            return nextGeneratedNumberSame;
        }

        if (lastDigitOfCandidate < 9) {
            const nextGeneratedNumberPlus = currentCandidate * 10 + (lastDigitOfCandidate + 1);
            numberQueue.push(nextGeneratedNumberPlus);
            discoveredCount++;
            if (discoveredCount === ordinalPosition) {
                return nextGeneratedNumberPlus;
            }
        }
    }

    return finalValue;
}

function ProcessInput(inputString) {
    const targetK = parseInt(inputString);
    const result = retrieveKthRunRun(targetK);
    console.log(result);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
