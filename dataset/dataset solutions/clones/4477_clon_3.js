'use strict'
function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const arrayLength = parseInt(lines[0], 10);
    const numericValues = lines[1].split(' ').map(item => parseInt(item, 10));

    const totalSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    let minimumDifference = Infinity;
    let currentPartitionSum = 0;

    for (let idx = 0; idx < arrayLength - 1; idx++) {
        currentPartitionSum += numericValues[idx];
        const doubledPartitionSum = 2 * currentPartitionSum;
        const absoluteDifference = Math.abs(totalSum - doubledPartitionSum);

        if (absoluteDifference < minimumDifference) {
            minimumDifference = absoluteDifference;
        }
    }
    console.log(minimumDifference);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
