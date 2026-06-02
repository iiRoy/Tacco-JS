'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

const solveKnapsackProblem = (inputLines) => {
    const parsedLines = inputLines.split("\n");

    const initialParameters = parsedLines[0].split(" ").map(Number);
    const itemCount = initialParameters[0];
    const weightCapacity = initialParameters[1];

    const itemWeights = new Array(itemCount);
    const itemValues = new Array(itemCount);

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
        const itemData = parsedLines[itemIndex + 1].split(" ").map(Number);
        itemWeights[itemIndex] = itemData[0];
        itemValues[itemIndex] = itemData[1];
    }

    const maxPossibleValueSum = 100000; // Maximum possible total value based on problem constraints

    // This array stores the minimum weight required to achieve a specific total value.
    // `minWeightForValue[val]` = minimum weight for total value `val`.
    // Initialize with Infinity for all values, except 0 which requires 0 weight.
    const minWeightForValue = Array.from({ length: maxPossibleValueSum + 1 }, () => Infinity);
    minWeightForValue[0] = 0;

    // Iterate through each available item
    for (let currentItemIdx = 0; currentItemIdx < itemCount; currentItemIdx++) {
        const currentItemWeight = itemWeights[currentItemIdx];
        const currentItemValue = itemValues[currentItemIdx];

        // Iterate through possible total values in reverse order.
        // This ensures that when calculating `minWeightForValue[targetVal]`,
        // `minWeightForValue[targetVal - currentItemValue]` refers to the state
        // *before* considering the `currentItemIdx`, preventing multiple uses of the same item.
        for (let targetVal = maxPossibleValueSum; targetVal >= currentItemValue; targetVal--) {
            // Decide whether to include the current item or not for `targetVal`:
            // 1. Don't include: The minimum weight remains `minWeightForValue[targetVal]` (from previous items).
            // 2. Include: The minimum weight would be `minWeightForValue[targetVal - currentItemValue]`
            //    (weight for the remaining value) plus the `currentItemWeight`.
            minWeightForValue[targetVal] = Math.min(
                minWeightForValue[targetVal],
                minWeightForValue[targetVal - currentItemValue] + currentItemWeight
            );
        }
    }

    // After processing all items, find the largest total value `v`
    // for which the `minWeightForValue[v]` does not exceed `weightCapacity`.
    let resultValue = 0;
    for (let valueCandidate = maxPossibleValueSum; valueCandidate >= 0; valueCandidate--) {
        if (minWeightForValue[valueCandidate] <= weightCapacity) {
            resultValue = valueCandidate;
            break;
        }
    }

    console.log(resultValue);
};

solveKnapsackProblem(require("fs").readFileSync("/dev/stdin", "utf8").trim());
