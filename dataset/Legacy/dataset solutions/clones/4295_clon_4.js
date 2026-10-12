'use strict';

const processInput = (rawData) => {
    const elementList = rawData.split('\n')[0].split(' ');

    const frequencyMap = elementList.reduce((accumulator, currentItem) => {
        return accumulator.set(currentItem, (accumulator.get(currentItem) || 0) + 1);
    }, new Map());

    const uniqueCandidate = elementList.find(item => frequencyMap.get(item) === 1);

    if (uniqueCandidate !== undefined) {
        console.log(uniqueCandidate);
    } else {
        console.log(elementList[2]);
    }
};

const acquireSourceData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

processInput(acquireSourceData());
