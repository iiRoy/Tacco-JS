const retrieveNthCount = (sortedFreqArray, index) => {
    if (sortedFreqArray && sortedFreqArray.length > index) {
        return sortedFreqArray[index][1];
    }
    return 0;
};

const buildFrequencyMap = (dataValues, startIndex, step) => {
    const freqMap = {};
    for (let currentIdx = startIndex; currentIdx < dataValues.length; currentIdx += step) {
        const value = dataValues[currentIdx];
        freqMap[value] = (freqMap[value] || 0) + 1;
    }
    return freqMap;
};

const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const dataRows = rawData.split('\n');
const elementCount = parseInt(dataRows[0].trim(), 10);
const valueArray = dataRows[1].trim().split(' ').map(Number);

const evenCountsMap = buildFrequencyMap(valueArray, 0, 2);
const oddCountsMap = buildFrequencyMap(valueArray, 1, 2);

const sortedEvenCounts = Object.entries(evenCountsMap).map(([key, value]) => [parseInt(key, 10), value]);
const sortedOddCounts = Object.entries(oddCountsMap).map(([key, value]) => [parseInt(key, 10), value]);

sortedEvenCounts.sort((a, b) => b[1] - a[1]);
sortedOddCounts.sort((a, b) => b[1] - a[1]);

let maxCommonElements = 0;

const topEvenValue = sortedEvenCounts.length > 0 ? sortedEvenCounts[0][0] : null;
const topEvenFrequency = retrieveNthCount(sortedEvenCounts, 0);
const secondEvenFrequency = retrieveNthCount(sortedEvenCounts, 1);

const topOddValue = sortedOddCounts.length > 0 ? sortedOddCounts[0][0] : null;
const topOddFrequency = retrieveNthCount(sortedOddCounts, 0);
const secondOddFrequency = retrieveNthCount(sortedOddCounts, 1);

if (topEvenValue !== topOddValue) {
    maxCommonElements = topEvenFrequency + topOddFrequency;
} else {
    const optionOneSum = topEvenFrequency + secondOddFrequency;
    const optionTwoSum = secondEvenFrequency + topOddFrequency;
    maxCommonElements = Math.max(optionOneSum, optionTwoSum);
}

console.log(elementCount - maxCommonElements);
