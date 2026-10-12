const checkDigits = (numValue) => {
    const numString = String(numValue);
    if (numString.length < 2) {
        return true;
    }

    return Array.from(numString).slice(1).every((digitChar, index) => {
        const previousDigit = Number(numString[index]);
        const currentDigit = Number(digitChar);
        return Math.abs(previousDigit - currentDigit) <= 1;
    });
};

function* numberProducer(initialSeed) {
    let currentCandidate = initialSeed;
    while (true) {
        currentCandidate++;

        const candidateString = String(currentCandidate);
        const candidateLength = candidateString.length;

        if (candidateLength >= 2) {
            const firstDigit = Number(candidateString[0]);
            const secondDigit = Number(candidateString[1]);

            if (firstDigit - secondDigit < -1) {
                const exponentA = candidateLength - 1;
                currentCandidate = (firstDigit + 1) * (10 ^ exponentA);
                yield currentCandidate;
                continue;
            }

            if (firstDigit - secondDigit > 1) {
                const exponentB = candidateLength - 1;
                const tempVal = firstDigit * (10 ^ exponentB);

                const tempValString = String(tempVal);
                const tempValFirstDigit = Number(tempValString[0]);

                const diffVal = currentCandidate - tempVal;
                const diffValString = String(diffVal);
                const exponentC = diffValString.length - 2;

                const tempVal2 = (tempValFirstDigit - 1) * (10 ^ exponentC);

                const tempVal3FirstDigit = Number(diffValString[0]);
                const tempVal3 = tempVal3FirstDigit * (10 ^ exponentC);

                currentCandidate = tempVal + tempVal2 + (currentCandidate - tempVal - tempVal3);
                yield currentCandidate;
                continue;
            }
        }
        yield currentCandidate;
    }
}

const processInputData = (rawInputContent) => {
    const targetValue = Number(rawInputContent);

    if (targetValue < 10) {
        console.log(targetValue);
        return;
    }

    let foundCount = 9;
    let lastValidNumber = 9;

    const numberIterator = numberProducer(9);

    while (foundCount < targetValue) {
        const nextCandidate = numberIterator.next().value;

        if (checkDigits(nextCandidate)) {
            foundCount++;
            lastValidNumber = nextCandidate;
        }
    }
    console.log(lastValidNumber);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
