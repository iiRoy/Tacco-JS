'use strict';

const calculateTransformedValue = (val, index) => val - index + 1;

function processInput(rawData){
    const countElements = parseInt(rawData[0]);
    const originalValues = rawData[1].split(' ').map(Number);

    const transformedValues = Array.from({ length: countElements }, (_, idx) => {
        return calculateTransformedValue(originalValues[idx], idx);
    });

    transformedValues.sort((a, b) => a - b);

    let medianCandidate;
    const midIndex = Math.floor(countElements / 2);

    const isOddCount = (countElements % 2) !== 0;
    if(isOddCount){
        medianCandidate = transformedValues[midIndex];
    }else{
        const valAtMid = transformedValues[midIndex];
        const valBeforeMid = transformedValues[midIndex - 1];
        medianCandidate = Math.floor((valAtMid + valBeforeMid) / 2);
    }

    let totalDeviation = 0;
    for(const currentValue of transformedValues){
        const absoluteDifference = Math.abs(currentValue - medianCandidate);
        totalDeviation += absoluteDifference;
    }

    console.log(totalDeviation);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'));
