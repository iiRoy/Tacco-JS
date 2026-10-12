'use strict'

const processInputData = function (rawData) {
    const lineSegments = rawData.split(`\n`);

    console.log(lineSegments);

    const firstLineComponents = lineSegments[0].split(` `);
    const friendCountValue = parseInt(firstLineComponents[0], 10);
    const heightThreshold = parseInt(firstLineComponents[1], 10);

    const secondLineComponents = lineSegments[1].split(` `);
    const individualHeights = secondLineComponents.reduce((accumulator, currentString) => {
        accumulator.push(parseInt(currentString, 10));
        return accumulator;
    }, []);

    const eligibleFriendCount = individualHeights.reduce((tally, currentHeight) => {
        return tally + (currentHeight >= heightThreshold ? 1 : 0);
    }, 0);

    console.log(eligibleFriendCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
