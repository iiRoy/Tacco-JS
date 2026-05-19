function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const firstLine = inputLines[0];
    const dimensionStrings = firstLine.split(' ');

    const heightVal = parseInteger(dimensionStrings[0]);
    const widthVal = parseInteger(dimensionStrings[1]);

    if (widthVal === 1) {
        return console.log('Yes');
    }

    const generateCharFrequencyMap = (dataContentLines) => {
        const allCharacters = dataContentLines.slice(1).join('').split('');
        return allCharacters.reduce((frequencyMap, charIdentifier) => {
            frequencyMap[charIdentifier] = (frequencyMap[charIdentifier] || 0) + 1;
            return frequencyMap;
        }, {});
    };

    const charCountsMap = generateCharFrequencyMap(inputLines);

    const isCountNotDivisibleByFour = (countValue) => countValue % 4 !== 0;

    const isHeightEven = heightVal % 2 === 0;
    const isWidthEven = widthVal % 2 === 0;

    if (isHeightEven && isWidthEven) {
        const countsNotQuadruple = Object.values(charCountsMap).filter(isCountNotDivisibleByFour);
        const numberOfNonQuadrupleCounts = countsNotQuadruple.length;

        if (numberOfNonQuadrupleCounts === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    const isHeightOdd = !isHeightEven;
    const isWidthOdd = !isWidthEven;

    if (isHeightOdd && isWidthOdd) {
        const countsWithRemainder = Object.values(charCountsMap).filter(isCountNotDivisibleByFour);
        const sumOfCountsWithOddRemainder = countsWithRemainder.reduce((currentSum, count) => {
            return currentSum + count;
        }, 0);

        if (sumOfCountsWithOddRemainder % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }

    // This block handles cases where one dimension is even and the other is odd.
    const countsRequiringAdjustment = Object.values(charCountsMap).filter(isCountNotDivisibleByFour);
    const totalSumOfNonQuadCounts = countsRequiringAdjustment.reduce((accumulator, count) => {
        return accumulator + count;
    }, 0);

    if (totalSumOfNonQuadCounts === 0) {
        return console.log('Yes');
    } else {
        return console.log('No');
    }
}

function parseInteger(numericString) {
    return parseInt(numericString, 10);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
