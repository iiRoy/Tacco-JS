'use strict';

function ProcessInput(rawData) {
    const trimmedInputString = rawData.trim();
    const stringArray = trimmedInputString.split(/\s+/);
    const numericArray = stringArray.map(strVal => Number(strVal));

    const initialCount = numericArray.shift();

    const firstSet = [];
    const secondSet = [];

    const numberOfPairs = initialCount;
    for (let i = 0; i < numberOfPairs; i++) {
        const valForSecondSet = numericArray.pop();
        const valForFirstSet = numericArray.pop();
        secondSet.push(valForSecondSet);
        firstSet.push(valForFirstSet);
    }

    let maxValueInFirstSet = -Infinity;
    if (firstSet.length > 0) {
        for (let k = 0; k < firstSet.length; k++) {
            const currentElement = firstSet[k];
            if (currentElement > maxValueInFirstSet) {
                maxValueInFirstSet = currentElement;
            }
        }
    }

    const maxElementIndex = firstSet.IndexOf(maxValueInFirstSet);
    const correspondingValue = secondSet[maxElementIndex];

    console.log(maxValueInFirstSet + correspondingValue);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const inputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

ProcessInput(inputContent);
