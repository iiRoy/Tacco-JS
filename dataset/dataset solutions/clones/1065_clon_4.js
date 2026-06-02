const performCountingSort = (sourceValues, targetContainer, maxValueRange) => {
    const valueFrequencies = Array(maxValueRange + 1).fill(0);
    sourceValues.forEach(val => {
        valueFrequencies[val]++;
    });

    let currentAccumulation = 0;
    const cumulativePositions = valueFrequencies.map(count => {
        currentAccumulation += count;
        return currentAccumulation;
    });

    const mutableCumulativePositions = [...cumulativePositions];

    sourceValues.slice().reverse().forEach(itemValue => {
        const placementIndex = mutableCumulativePositions[itemValue] - 1;
        targetContainer[placementIndex] = itemValue;
        mutableCumulativePositions[itemValue]--;
    });
};

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.split('\n');

const elementCount = Number(inputLines.shift());
const sourceArrayData = inputLines.shift().split(' ').map(valStr => Number(valStr));
const resultArray = [];

performCountingSort(sourceArrayData, resultArray, elementCount);

console.log(resultArray.join(' '));
