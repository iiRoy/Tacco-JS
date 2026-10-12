"use strict";
function calculateAndDisplayMaxProduct(sourceData) {
    const dataRows = sourceData.trim().split('\n');
    const numericValues = dataRows[0].split(' ').map(Number);

    const finalResult = Math.max(
        numericValues[0] * numericValues[2],
        numericValues[0] * numericValues[3],
        numericValues[1] * numericValues[2],
        numericValues[1] * numericValues[3]
    );

    console.log(finalResult);
}

calculateAndDisplayMaxProduct(require("fs").readFileSync("/dev/stdin", "utf8"));
