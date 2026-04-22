const parseDecimalInt = (textValue) => {
    const numericValue = parseInt(textValue, 10);
    if (isNaN(numericValue)) {
        // Log a warning or handle invalid input; for contest programming, assume valid.
        return 0;
    }
    return numericValue;
};

const outputFinalResult = (canFormPalindrome) => {
    console.log(canFormPalindrome ? 'Yes' : 'No');
};

function GridPalindromeChecker(gridInputString) {
    const allInputLines = gridInputString.split('\n');

    const dimensionTokens = allInputLines[0].split(' ');
    const rowsCount = parseDecimalInt(dimensionTokens[0]);
    const colsCount = parseDecimalInt(dimensionTokens[1]);

    if (rowsCount <= 0 || colsCount <= 0) {
        return outputFinalResult(false);
    }

    if (colsCount === 1) {
        return outputFinalResult(true);
    }

    const gridCharacters = allInputLines
        .slice(1)
        .flatMap(line => line.split(''));

    const charCounts = gridCharacters.reduce((currentCountsMap, singleChar) => {
        currentCountsMap[singleChar] = (currentCountsMap[singleChar] || 0) + 1;
        return currentCountsMap;
    }, {});

    const isRowsEven = rowsCount % 2 === 0;
    const isColsEven = colsCount % 2 === 0;

    if (isRowsEven && isColsEven) {
        const countsNotDivisibleByFour = Object.values(charCounts).filter(
            countValue => countValue % 4 !== 0
        );
        if (countsNotDivisibleByFour.length === 0) {
            return outputFinalResult(true);
        } else {
            return outputFinalResult(false);
        }
    }

    if (!isRowsEven && !isColsEven) {
        const nonFourMultipleCounts = Object.values(charCounts).filter(
            countValue => countValue % 4 !== 0
        );

        const totalSumOfNonFourMultiples = nonFourMultipleCounts.reduce(
            (accumulator, currentCount) => accumulator + currentCount,
            0
        );

        if (totalSumOfNonFourMultiples % 2 === 1) {
            return outputFinalResult(true);
        } else {
            return outputFinalResult(false);
        }
    }

    return outputFinalResult(false);
}

try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    GridPalindromeChecker(fileContent);
} catch (executionError) {
    console.error("An unexpected error occurred:", executionError.message);
    outputFinalResult(false);
}