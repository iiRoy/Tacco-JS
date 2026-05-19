const inputData = require("fs").readFileSync("/dev/stdin", "utf8");

const dataLines = inputData.split('\n');
const arraySize = Number(dataLines[0]);
const alphaNums = dataLines[1].split(' ');
const betaNums = dataLines[2].split(' ');
const gammaNums = dataLines[3].split(' ');

const numericSortAsc = (val1, val2) => val1 - val2;

const alphaSet = alphaNums.map(Number).sort(numericSortAsc);
const betaSet = betaNums.map(Number).sort(numericSortAsc);
const gammaSet = gammaNums.map(Number).sort(numericSortAsc);

const findCountLessThan = (sortedArr, targetVal) => {
    let lowIdx = 0;
    let highIdx = sortedArr.length;
    while (lowIdx < highIdx) {
        const midIdx = Math.floor((lowIdx + highIdx) / 2);
        if (sortedArr[midIdx] < targetVal) {
            lowIdx = midIdx + 1;
        } else {
            highIdx = midIdx;
        }
    }
    return lowIdx;
};

const findCountLessEqual = (sortedArr, targetVal) => {
    let lowIdx = 0;
    let highIdx = sortedArr.length;
    while (lowIdx < highIdx) {
        const midIdx = Math.floor((lowIdx + highIdx) / 2);
        if (sortedArr[midIdx] <= targetVal) {
            lowIdx = midIdx + 1;
        } else {
            highIdx = midIdx;
        }
    }
    return lowIdx;
};

const totalResult = betaSet.reduce((accumulator, currentBetaVal) => {
    const countAlphaSmaller = findCountLessThan(alphaSet, currentBetaVal);
    const countGammaSmallerEqual = findCountLessEqual(gammaSet, currentBetaVal);
    const countGammaLarger = arraySize - countGammaSmallerEqual;
    return accumulator + (countAlphaSmaller * countGammaLarger);
}, 0);

console.log(totalResult);
