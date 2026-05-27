const inputSource = require("fs").readFileSync(0, "utf8");
const processedLines = inputSource.trim().split("\n");

const totalElementsCount = Number(processedLines[0]);
const elementSequence = processedLines[1].split(" ");

const evenPositionValueCounts = new Map();
const oddPositionValueCounts = new Map();

elementSequence.forEach((currentValue, currentIndex) => {
    const targetFrequencyMap = currentIndex % 2 === 0 ? evenPositionValueCounts : oddPositionValueCounts;
    targetFrequencyMap.set(currentValue, (targetFrequencyMap.get(currentValue) || 0) + 1);
});

const emptyFrequencyEntry = { itemValue: null, occurrenceCount: 0 };

const sortedEvenPositionFrequencies = Array.from(evenPositionValueCounts.entries())
    .map(([val, count]) => ({ itemValue: val, occurrenceCount: count }))
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);

const sortedOddPositionFrequencies = Array.from(oddPositionValueCounts.entries())
    .map(([val, count]) => ({ itemValue: val, occurrenceCount: count }))
    .sort((a, b) => b.occurrenceCount - a.occurrenceCount);

const mostFrequentEven = sortedEvenPositionFrequencies[0] || emptyFrequencyEntry;
const secondMostFrequentEven = sortedEvenPositionFrequencies[1] || emptyFrequencyEntry;

const mostFrequentOdd = sortedOddPositionFrequencies[0] || emptyFrequencyEntry;
const secondMostFrequentOdd = sortedOddPositionFrequencies[1] || emptyFrequencyEntry;

let maximumUnchangedElements;

if (mostFrequentEven.itemValue !== mostFrequentOdd.itemValue) {
    maximumUnchangedElements = mostFrequentEven.occurrenceCount + mostFrequentOdd.occurrenceCount;
} else {
    const strategyOneKept = mostFrequentEven.occurrenceCount + secondMostFrequentOdd.occurrenceCount;
    const strategyTwoKept = secondMostFrequentEven.occurrenceCount + mostFrequentOdd.occurrenceCount;
    maximumUnchangedElements = Math.max(strategyOneKept, strategyTwoKept);
}

console.log(totalElementsCount - maximumUnchangedElements);
