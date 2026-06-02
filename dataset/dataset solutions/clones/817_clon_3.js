const calculatePowerOfTen = (exponentValue) => Math.pow(10, Math.floor(exponentValue));

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLinesArray;
let currentCaseIndex;
let foundPairs;
let currentCaseParameters;
let numberA;
let numberB;

process.stdin.on('data', function(incomingData) {
    inputLinesArray = incomingData.split('\n');
    const totalCasesCount = parseInt(inputLinesArray[0], 10);

    for (currentCaseIndex = 0; currentCaseIndex < totalCasesCount; ++currentCaseIndex) {
        foundPairs = [];
        currentCaseParameters = inputLinesArray[currentCaseIndex + 1].split(' ');

        const digitsCountA = parseInt(currentCaseParameters[0], 10);
        const digitsCountB = parseInt(currentCaseParameters[1], 10);

        const lowerBoundA = calculatePowerOfTen(digitsCountA - 1);
        const upperBoundA = calculatePowerOfTen(digitsCountA) - 1;
        const lowerBoundB = calculatePowerOfTen(digitsCountB - 1);
        const upperBoundB = calculatePowerOfTen(digitsCountB) - 1;

        for (numberA = lowerBoundA; numberA <= upperBoundA; ++numberA) {
            for (numberB = lowerBoundB; numberB <= upperBoundB; ++numberB) {
                const sumOfArithmeticSeries = (numberA + numberB) * (numberB - numberA + 1) / 2;
                const concatenatedNumberValue = parseInt(String(numberA) + String(numberB), 10);

                if (sumOfArithmeticSeries === concatenatedNumberValue) {
                    foundPairs.push(numberA + ' ' + numberB);
                }
            }
        }

        if (foundPairs.length > 0) {
            foundPairs.forEach(pairString => {
                console.log(pairString);
            });
        } else {
            console.log('No cats.');
        }
    }
});
