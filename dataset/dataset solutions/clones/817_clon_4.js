const queryInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedUserLines = [];
let totalExpectedQueries = -1;

const computePowerOfTen = (exponentValue) => {
    let currentPower = 1;
    for (let k = 0; k < exponentValue; ++k) {
        currentPower *= 10;
    }
    return currentPower;
};

const generateNumericSequence = (startingPoint, endingPoint) => {
    const sequenceContainer = [];
    for (let num = startingPoint; num <= endingPoint; ++num) {
        sequenceContainer.push(num);
    }
    return sequenceContainer;
};

queryInterface.on('line', (incomingLine) => {
    if (totalExpectedQueries === -1) {
        totalExpectedQueries = parseInt(incomingLine, 10);
    } else {
        collectedUserLines.push(incomingLine);
    }

    if (collectedUserLines.length === totalExpectedQueries) {
        queryInterface.close();
    }
});

queryInterface.on('close', () => {
    for (let queryIndex = 0; queryIndex < collectedUserLines.length; ++queryIndex) {
        const queryParameters = collectedUserLines[queryIndex].split(' ').map(Number);
        const firstDigitCount = queryParameters[0];
        const secondDigitCount = queryParameters[1];

        const firstRangeLower = computePowerOfTen(firstDigitCount - 1);
        const firstRangeUpper = computePowerOfTen(firstDigitCount) - 1;

        const secondRangeLower = computePowerOfTen(secondDigitCount - 1);
        const secondRangeUpper = computePowerOfTen(secondDigitCount) - 1;

        const currentQueryMatches = [];

        const potentialFirstValues = generateNumericSequence(firstRangeLower, firstRangeUpper);
        const potentialSecondValues = generateNumericSequence(secondRangeLower, secondRangeUpper);

        for (const candidateX of potentialFirstValues) {
            for (const candidateY of potentialSecondValues) {
                const numberOfTerms = candidateY - candidateX + 1;
                const arithmeticSum = (candidateX + candidateY) * numberOfTerms / 2;

                const stringConcatenation = `${candidateX}${candidateY}`;
                const numericConcatenation = Number(stringConcatenation);

                if (arithmeticSum === numericConcatenation) {
                    currentQueryMatches.push(`${candidateX} ${candidateY}`);
                }
            }
        }

        if (currentQueryMatches.length > 0) {
            currentQueryMatches.forEach(resultEntry => console.log(resultEntry));
        } else {
            console.log('No cats.');
        }
    }
});