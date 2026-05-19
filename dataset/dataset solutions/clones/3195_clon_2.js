let inputData = [];
let targetSum, itemCount;
let itemSpecs, memoTable;

const lineReader = require('readline');

const interfaceInstance = lineReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function (inputLine) {
    inputData.push(inputLine);
});

interfaceInstance.on('close', function () {
    // This array maps a digit (index) to the number of matches required to display it.
    const digitMatchCounts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    // Parse the first line for the target sum (N) and number of available items (M).
    targetSum = Number(inputData[0].split(" ")[0]);
    itemCount = Number(inputData[0].split(" ")[1]);

    // Initialize an array to store specifications for each item (digit).
    itemSpecs = Array(itemCount + 1);

    // The 0th index is unused or can be a placeholder.
    itemSpecs[0] = { value: 0, cost: 0 };

    // Parse the second line for the actual digits available.
    const tempInput = inputData[1].split(" ");
    for (let idx = 1; idx <= itemCount; idx++) {
        const digitValue = Number(tempInput[idx - 1]);
        itemSpecs[idx] = {
            value: digitValue,
            cost: Number(digitMatchCounts[digitValue]),
        };
    }

    // Initialize a string variable to hold the current best candidate number.
    let currentCandidate = "";
    // Initialize the dynamic programming table. Each entry will store the largest number string
    // that can be formed using 'index' number of matches.
    memoTable = Array(targetSum + 1).fill("");

    // Iterate through all possible match counts from 1 up to the target sum.
    for (let currentWeight = 1; currentWeight <= targetSum; currentWeight++) {
        // For each match count, iterate through all available items (digits).
        for (let currentItemIndex = 1; currentItemIndex <= itemCount; currentItemIndex++) {
            // Calculate the remaining matches if the current item is used.
            let remainingWeight = currentWeight - itemSpecs[currentItemIndex].cost;

            // If using the current item results in a negative remaining weight, it's not possible.
            if (remainingWeight < 0) {
                continue;
            } else {
                // Form a new candidate number by appending the current item's value
                // to the largest number formed with the remaining matches.
                currentCandidate = memoTable[remainingWeight] + itemSpecs[currentItemIndex].value;

                // If the current candidate is longer, or if it's the same length but lexicographically larger,
                // update the memoTable entry for the current weight.
                if (memoTable[currentWeight].length < currentCandidate.length ||
                    (memoTable[currentWeight].length === currentCandidate.length && memoTable[currentWeight] < currentCandidate)) {
                    memoTable[currentWeight] = currentCandidate;
                }
            }
        }
    }

    // Output the largest number that can be formed using exactly 'targetSum' matches.
    console.log(memoTable[targetSum]);
});
