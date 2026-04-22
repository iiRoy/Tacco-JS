'use strict';

function ComputeSumOfTwoSmallest(rawText) {
    const firstLineContent = rawText.split('\n')[0];
    const stringNumbers = firstLineContent.match(/\S+/g);

    let smallestValueOne = Infinity;
    let smallestValueTwo = Infinity;

    for (const currentString of stringNumbers) {
        const currentNumber = +currentString;

        if (currentNumber < smallestValueOne) {
            smallestValueTwo = smallestValueOne;
            smallestValueOne = currentNumber;
        } else if (currentNumber < smallestValueTwo) {
            smallestValueTwo = currentNumber;
        }
    }

    return smallestValueOne + smallestValueTwo;
}

(function() {
    const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
    console.log(ComputeSumOfTwoSmallest(dataSource));
})();