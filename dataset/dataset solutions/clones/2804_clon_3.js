"use strict";

const sumArrayElements = (arr) => {
    return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

const processInputAndCalculate = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    const firstLineData = inputLines[0].split(" ");

    const numberOfPies = parseInt(firstLineData[0], 10);
    const baseFlavorValue = parseInt(firstLineData[1], 10);

    let pieFlavorList = [];

    for (let pieIndex = 0; pieIndex < numberOfPies; pieIndex++) {
        const calculatedFlavor = baseFlavorValue + pieIndex;
        pieFlavorList.push(calculatedFlavor);
    }

    const initialTotalFlavorSum = sumArrayElements(pieFlavorList);

    let minimumAbsoluteFlavor = Number.POSITIVE_INFINITY;
    let indexToExclude = -1;

    for (let i = 0; i < numberOfPies; i++) {
        const currentFlavorInList = pieFlavorList[i];
        const absoluteCurrentFlavor = Math.abs(currentFlavorInList);

        if (absoluteCurrentFlavor < minimumAbsoluteFlavor) {
            minimumAbsoluteFlavor = absoluteCurrentFlavor;
            indexToExclude = i;
        }
    }

    if (indexToExclude !== -1) {
        pieFlavorList.splice(indexToExclude, 1);
    }

    const finalFlavorSum = sumArrayElements(pieFlavorList);
    console.log(finalFlavorSum);
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
