"use strict"

const processInput = (rawData) => {
    const targetString = rawData;
    let finalCost = 700;
    const incrementAmount = 100;
    const matchingSymbol = "○";
    const checkCount = 3;

    for (let i = 0; i < checkCount; i++) {
        const currentCharacter = targetString[i];
        if (currentCharacter === matchingSymbol) {
            finalCost += incrementAmount;
        }
    }

    console.log(finalCost);
};

processInput(require("fs").readFileSync("/dev/stdin","utf8"));
