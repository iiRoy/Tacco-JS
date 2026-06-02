"use strict"
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

const linesArray = rawData.split("\n");

const elementCountString = linesArray[0];
const totalElements = parseInt(elementCountString, 10);

const numberValueStrings = linesArray[1].split(" ");
const numericValues = numberValueStrings.map((strItem) => {
    return Number(strItem);
});

let resultCounter = 0;

const TARGET_EVEN_MODULO = 0;
const TARGET_ODD_MODULO = 1;

for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    const isCurrentIndexEven = (currentIdx % 2 === TARGET_EVEN_MODULO);
    const isCurrentValueOdd = (numericValues[currentIdx] % 2 === TARGET_ODD_MODULO);

    if (isCurrentIndexEven && isCurrentValueOdd) {
        resultCounter++;
    }
}

console.log(resultCounter);
