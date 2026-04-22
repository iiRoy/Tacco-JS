'use strict';

function calculateAdjustedProduct(rawStringData) {
    const numberPatterns = /\d+/g;
    const stringNumbers = rawStringData.match(numberPatterns);

    const firstValue = parseInt(stringNumbers[0], 10);
    const secondValue = parseInt(stringNumbers[1], 10);

    const productOfDecremented = (x, y) => (x * y) - x - y + 1;

    console.log(productOfDecremented(firstValue, secondValue));
}

calculateAdjustedProduct(require("fs").readFileSync("/dev/stdin", "utf8"));