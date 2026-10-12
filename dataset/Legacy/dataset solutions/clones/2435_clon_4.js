"use strict";

function computeProductSeries(val) {
    if (val === 0) return 0;
    if (val === 1) return 1;
    let currentProduct = 1;
    for (let k = 2; k <= val; k++) {
        currentProduct *= k;
    }
    return currentProduct;
}

const processInputData = rawData => {
    const [firstLine] = rawData.trim().split("\n");
    const [firstValStr, secondValStr] = firstLine.split(" ");
    const firstVal = parseInt(firstValStr);
    const secondVal = parseInt(secondValStr);

    const maxTwosPossible = Math.floor(firstVal / 2);

    let finalResult = 0;

    const requiredI = (2 * firstVal - secondVal) / 3;

    if (Number.isInteger(requiredI) && requiredI >= 0 && requiredI <= maxTwosPossible) {
        const currentI = requiredI;
        const currentOnes = firstVal - (2 * currentI);
        
        const termA = computeProductSeries(firstVal);
        const termB = computeProductSeries(2 * currentI) + computeProductSeries(currentOnes);

        finalResult = termA / termB;
    }
    
    console.log(finalResult % 10e9);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
