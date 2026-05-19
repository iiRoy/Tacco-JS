const parseNumericPair = (lineContent) => {
    return lineContent.split(" ").map(strVal => parseInt(strVal, 10));
};

const compareForFirstList = (pairOne, pairTwo) => {
    if (pairOne[0] > pairOne[1]) {
        return pairOne[1] - pairTwo[1];
    } else {
        return pairOne[0] - pairTwo[0];
    }
};

const compareForSecondList = (pairOne, pairTwo) => {
    if (pairOne[0] > pairOne[1]) {
        return pairTwo[1] - pairOne[1];
    } else {
        return pairOne[0] - pairTwo[0];
    }
};

function processInputData(inputLines) {
    const totalPairsCount = parseInt(inputLines[0], 10);

    let firstCollection = [];
    let secondCollection = [];

    for (let i = 1; i <= totalPairsCount; i++) {
        firstCollection.push(parseNumericPair(inputLines[i]));
        secondCollection.push(parseNumericPair(inputLines[i + totalPairsCount]));
    }

    firstCollection.sort(compareForFirstList);
    secondCollection.sort(compareForSecondList);

    let firstPointer = 0;
    let secondPointer = 0;
    let successfulMatches = 0;

    while (firstPointer < totalPairsCount && secondPointer < totalPairsCount) {
        const currentFirst = firstCollection[firstPointer];
        const currentSecond = secondCollection[secondPointer];

        const isMatchPossible = currentFirst[0] < currentSecond[0] && currentFirst[1] < currentSecond[1];

        if (isMatchPossible) {
            successfulMatches++;
            firstPointer++;
            secondPointer++;
        } else {
            secondPointer++;
        }
    }

    console.log(successfulMatches);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
