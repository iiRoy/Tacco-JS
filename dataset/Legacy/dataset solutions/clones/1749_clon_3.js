const fileSystem = require('fs');
const STDIN_FILE_PATH = '/dev/stdin';
const ZERO_INITIAL_SUM = 0;

const rawInputData = fileSystem.readFileSync(STDIN_FILE_PATH, 'utf8');
let inputLines = rawInputData.split('\n');

const initialArrayLength = Number(inputLines.shift());
let currentDataArray = inputLines.shift().split(' ').map(val => Number(val));
const numberOfQueries = Number(inputLines.shift());
inputLines.pop();

const sumReducer = (currentTotal, element) => currentTotal + element;

function extractQueryValues(queryLineString) {
    const parts = queryLineString.split(' ');
    const targetValue = parseInt(parts[0], 10);
    const replacementValue = parseInt(parts[1], 10);
    return { targetValue, replacementValue };
}

let runningSum = ZERO_INITIAL_SUM;

for (let queryIteration = 0; queryIteration < numberOfQueries; queryIteration++) {
    const { targetValue, replacementValue } = extractQueryValues(inputLines[queryIteration]);

    const targetValueIndex = currentDataArray.indexOf(targetValue);
    const isTargetValueFound = targetValueIndex !== -1;

    if (runningSum > ZERO_INITIAL_SUM && !isTargetValueFound) {
        console.log(runningSum);
        continue;
    }

    const mapReplacement = (element) => {
        return (element === targetValue) ? replacementValue : element;
    };

    currentDataArray = currentDataArray.map(mapReplacement);

    runningSum = currentDataArray.reduce(sumReducer, ZERO_INITIAL_SUM);

    console.log(runningSum);
}
