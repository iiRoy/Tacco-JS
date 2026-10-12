"use strict";

function processInput(rawData) {
    const refinedString = rawData.trim();
    const segmentCollection = [];
    let currentFragment = '';

    for (let charIndex = 0; charIndex < refinedString.length; charIndex++) {
        const character = refinedString[charIndex];
        if (character === ' ') {
            segmentCollection.push(currentFragment);
            currentFragment = '';
        } else {
            currentFragment += character;
        }
    }
    segmentCollection.push(currentFragment);

    const firstElement = segmentCollection[0];
    const secondElement = segmentCollection[1];

    console.log(secondElement + firstElement);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
