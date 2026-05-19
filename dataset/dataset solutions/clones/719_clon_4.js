function* generateSequenceTerms(limitValue) {
    yield 0;

    let currentTerm = 1;
    let termStep = 1;
    let stepIncrement = 1;

    while (currentTerm <= limitValue) {
        yield currentTerm;
        stepIncrement++;
        termStep += stepIncrement;
        currentTerm += termStep;
    }
}

function calculateMinCoinsAll(targetValue) {
    const availableDenominations = Array.from(generateSequenceTerms(targetValue));

    const minimumCounts = new Array(targetValue + 1).fill(Infinity);
    minimumCounts[0] = 0;

    for (const denomination of availableDenominations) {
        if (denomination === 0) {
            continue;
        }
        for (let currentSum = denomination; currentSum <= targetValue; currentSum++) {
            minimumCounts[currentSum] = Math.min(
                minimumCounts[currentSum],
                minimumCounts[currentSum - denomination] + 1
            );
        }
    }

    return minimumCounts[targetValue];
}

function calculateMinCoinsOdd(targetValue) {
    const availableOddDenominations = Array.from(generateSequenceTerms(targetValue)).filter(
        (val) => val === 0 || val % 2 !== 0
    );

    const minimumCounts = new Array(targetValue + 1).fill(Infinity);
    minimumCounts[0] = 0;

    for (const denomination of availableOddDenominations) {
        if (denomination === 0) {
            continue;
        }
        for (let currentSum = denomination; currentSum <= targetValue; currentSum++) {
            minimumCounts[currentSum] = Math.min(
                minimumCounts[currentSum],
                minimumCounts[currentSum - denomination] + 1
            );
        }
    }

    return minimumCounts[targetValue];
}

function processInputAndOutput(inputData) {
    const linesOfInput = inputData.split("\n");
    let currentLineIndex = 0;

    while (true) {
        const parsedNumber = parseInt(linesOfInput[currentLineIndex], 10);
        if (parsedNumber === 0) {
            break;
        }
        console.log(calculateMinCoinsAll(parsedNumber), calculateMinCoinsOdd(parsedNumber));
        currentLineIndex++;
    }
}

processInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
