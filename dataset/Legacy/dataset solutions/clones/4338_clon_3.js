function processGridData(inputData) {
    const dimensionsLineParts = inputData.split('\n')[0].split(' ');
    const gridHeight = parseNum(dimensionsLineParts[0]);
    const gridWidth = parseNum(dimensionsLineParts[1]);

    if (gridWidth === 1) {
        return console.log('Yes');
    }

    const gridLines = inputData.split('\n').slice(1);
    const charCountsMap = countCharacters(gridLines);

    const nonQuadrupleCounts = getNonQuadrupleCounts(charCountsMap);

    const isHeightEven = (gridHeight % 2 === 0);
    const isWidthEven = (gridWidth % 2 === 0);

    if (isHeightEven && isWidthEven) {
        const nonQuadrupleCountLength = nonQuadrupleCounts.length;
        if (nonQuadrupleCountLength === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    } else if (!isHeightEven && !isWidthEven) {
        const oddRemainderSum = nonQuadrupleCounts.reduce((currentSum, count) => currentSum + count, 0);
        if (oddRemainderSum % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    } else {
        const finalOddRemainderSum = nonQuadrupleCounts.reduce((currentSum, count) => currentSum + count, 0);
        if (finalOddRemainderSum === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }
}

function parseNum(str) {
    return parseInt(str, 10);
}

function countCharacters(linesArray) {
    const characterFrequency = {};
    const allGridCharacters = linesArray.join('').split('');
    for (const charVal of allGridCharacters) {
        characterFrequency[charVal] = (characterFrequency[charVal] || 0) + 1;
    }
    return characterFrequency;
}

function getNonQuadrupleCounts(countsMap) {
    const filteredCounts = [];
    for (const charKey in countsMap) {
        if (countsMap[charKey] % 4 !== 0) {
            filteredCounts.push(countsMap[charKey]);
        }
    }
    return filteredCounts;
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
