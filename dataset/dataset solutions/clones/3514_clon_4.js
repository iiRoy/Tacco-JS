const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputLines = inputContent.split('\n');
const totalCount = Number(inputLines[0]);
const numberSequence = inputLines[1].split(' ').map(Number);

const evenIndexedNumbers = numberSequence.filter((_, idx) => idx % 2 === 0);
const oddIndexedNumbers = numberSequence.filter((_, idx) => idx % 2 !== 0);

const countFrequencies = (arr) => arr.reduce((acc, val) => acc.set(val, (acc.get(val) || 0) + 1), new Map());

const evenFrequencies = countFrequencies(evenIndexedNumbers);
const oddFrequencies = countFrequencies(oddIndexedNumbers);

const prepareRankedList = (freqMap) => {
    const list = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
    while (list.length < 2) {
        list.push([null, 0]);
    }
    return list;
};

const rankedEven = prepareRankedList(evenFrequencies);
const rankedOdd = prepareRankedList(oddFrequencies);

const [topEvenValue, topEvenFrequency] = rankedEven[0];
const [secondEvenValue, secondEvenFrequency] = rankedEven[1];
const [topOddValue, topOddFrequency] = rankedOdd[0];
const [secondOddValue, secondOddFrequency] = rankedOdd[1];

const maxSameCount = (topEvenValue !== topOddValue)
    ? (topEvenFrequency + topOddFrequency)
    : Math.max(
        topEvenFrequency + secondOddFrequency,
        secondEvenFrequency + topOddFrequency
    );

console.log(totalCount - maxSameCount);
