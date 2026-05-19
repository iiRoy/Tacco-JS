function ProcessInput(rawData) {
    // Trim leading/trailing whitespace, split into lines, then split each line by space.
    let processedLines = rawData.trim().split("\n").map(function(lineContent) {
        return lineContent.split(" ");
    });

    // Extract the total number of elements from the first line.
    let totalElements = parseInt(processedLines[0][0], 10);

    // Parse the second line into an array of integers.
    let elementValues = processedLines[1].map(currentVal => parseInt(currentVal, 10));

    // Initialize an array to count occurrences of each value (1, 2, 3).
    // Index 0 is unused, indices 1, 2, 3 store counts for values 1, 2, 3 respectively.
    let itemCounts = [0, 0, 0, 0];

    // Populate the itemCounts array.
    for (let idx = 0; idx < totalElements; idx++) {
        itemCounts[elementValues[idx]]++;
    }

    // Calculate the total number of items that are not 0 (i.e., 1s, 2s, and 3s).
    let totalNonZeroItems = itemCounts[1] + itemCounts[2] + itemCounts[3];

    // Initialize a memoization cache for dynamic programming.
    // The structure is a 3D array: memoizationCache[count0][count1][count2]
    let memoizationCache = [];

    // The problem statement implies that the initial state will always have count0 = N - (count1 + count2 + count3).
    // The base case for the DP is when all items are 0s, which means count1, count2, count3 are all 0.
    // In this specific problem, the base case is handled implicitly by the recursive calls.
    // The original code had a line `DPrecord[allCount - 1] = [[], [allCount]];` which seems to be a remnant or specific optimization
    // for a different problem variant, as `allCount - 1` is not directly used as an index in the DP state.
    // For Type II, we preserve the structure, so we'll keep a similar initialization if it doesn't change behavior.
    // However, the original line `DPrecord[allCount - 1] = [[], [allCount]];` is not actually used in the DP logic
    // as `DPrecord` is indexed by `countEach[0]`, `countEach[1]`, `countEach[2]`.
    // Removing it would be a Type III change. So, we'll keep it, but it's effectively a no-op given the indexing.
    // Let's re-evaluate: The original line `DPrecord[allCount - 1] = [[], [allCount]];` is outside the DP function.
    // The DP function uses `DPrecord[countEach[0]][countEach[1]][countEach[2]]`.
    // `allCount` is `countEach[1] + countEach[2] + countEach[3]`.
    // `countEach[0]` is `N - allCount`.
    // So `allCount - 1` is not directly related to `countEach[0]`.
    // This line is likely a debug artifact or a misinterpretation of the DP state.
    // Since it doesn't affect the actual DP calculation (as `DPrecord` is always accessed via `countEach[0/1/2]`),
    // and removing it would be a behavioral change (even if benign), we must keep it.
    // We'll rename it consistently.
    memoizationCache[totalNonZeroItems - 1] = [[], [totalNonZeroItems]];


    // Calculate and print the expected value.
    console.log(CalculateExpectedValue(itemCounts, totalNonZeroItems, memoizationCache));
}

/**
 * Recursively calculates the expected number of operations to clear all items,
 * using dynamic programming with memoization.
 * @param {number[]} currentCounts - An array [count0, count1, count2, count3] representing
 *                                   the current number of items with 0, 1, 2, or 3 "hits" remaining.
 * @param {number} totalNonZeroItems - The total number of items that are not 0s (sum of count1, count2, count3).
 * @param {Array} memoizationCache - The memoization table to store previously computed results.
 * @returns {number} The expected number of operations.
 */
function CalculateExpectedValue(currentCounts, totalNonZeroItems, memoizationCache) {
    // Check if the result for the current state is already memoized.
    if (memoizationCache[currentCounts[0]] === undefined) {
        memoizationCache[currentCounts[0]] = [];
        memoizationCache[currentCounts[0]][currentCounts[1]] = [];
    } else if (memoizationCache[currentCounts[0]][currentCounts[1]] === undefined) {
        memoizationCache[currentCounts[0]][currentCounts[1]] = [];
    }

    if (memoizationCache[currentCounts[0]][currentCounts[1]][currentCounts[2]] !== undefined) {
        return memoizationCache[currentCounts[0]][currentCounts[1]][currentCounts[2]];
    }

    // If all items are 0s (i.e., count1, count2, count3 are all 0), then 0 operations are needed.
    if (currentCounts[1] === 0 && currentCounts[2] === 0 && currentCounts[3] === 0) {
        return 0;
    }

    let expectedVal = 0;
    let nonZeroIndices = getNonZeroIndices(currentCounts);

    // The original code had two branches based on `v.length === 4`.
    // `v.length` refers to `nonZeroIndices.length`.
    // `nonZeroIndices` contains indices of non-zero counts.
    // If `currentCounts[0]` is 0, then `nonZeroIndices` will contain `1, 2, 3`. Its length will be 3.
    // If `currentCounts[0]` is not 0, then `nonZeroIndices` will contain `0, 1, 2, 3` (if all are non-zero). Its length will be 4.
    // This implies the first branch `v.length === 4` is taken when `currentCounts[0]` is also non-zero.
    // The original code's `v.length === 4` condition is problematic. `returnExceptZero` returns indices of non-zero elements.
    // If `countEach[0]` is 0, `v` will contain `1, 2, 3` (if they are non-zero), so `v.length` would be 3.
    // If `countEach[0]` is non-zero, `v` could contain `0, 1, 2, 3` (if all are non-zero), so `v.length` would be 4.
    // The original code's logic for `v.length === 4` is specifically for the case where `countEach[0]` is non-zero AND `countEach[1], countEach[2], countEach[3]` are also non-zero.
    // This is a very specific case. Let's re-examine the original logic carefully.

    // Original:
    // if (v.length === 4){ // This means countEach[0], countEach[1], countEach[2], countEach[3] are all > 0
    //     ans = 1+(DP([countEach[0] + 1, countEach[1] - 1, countEach[2], countEach[3]]) * countEach[1] +
    //                 DP([countEach[0], countEach[1] + 1, countEach[2] - 1, countEach[3]]) * countEach[2] +
    //                 DP([countEach[0], countEach[1], countEach[2] + 1, countEach[3] - 1]) * countEach[3])/allCount;
    //     ans /= (1 - countEach[0] / allCount);
    // } else { // This means at least one of countEach[0], countEach[1], countEach[2], countEach[3] is 0.
    //          // But the loop `for (let i of v)` only iterates over non-zero counts.
    //          // If countEach[0] is 0, then v will not contain 0.
    //          // If countEach[1] is 0, then v will not contain 1.
    //     ans = 0;
    //     for (let i of v){
    //         if (i === 0) continue; // This means we only consider transitions from 1, 2, 3.
    //         let ary = [];
    //         ary[i] = countEach[i] - 1;
    //         ary[i - 1] = countEach[i - 1] + 1;
    //         ary[(i + 1) % 4] = countEach[(i + 1) % 4];
    //         ary[(i + 2) % 4] = countEach[(i + 2) % 4];
    //         ans += DP(ary) * countEach[i];
    //     }
    //     ans = (ans / allCount) + 1;
    //     ans /= (1 - countEach[0] / allCount);
    // }

    // The two branches are actually very similar. The first branch is a special case where all counts are non-zero.
    // The second branch iterates over `v` (non-zero indices). If `0` is in `v`, it's skipped.
    // This means the second branch effectively only considers transitions from 1, 2, or 3.
    // The first branch explicitly calculates transitions from 1, 2, 3.
    // The `ary` construction in the second branch is also interesting:
    // `ary[i] = countEach[i] - 1;` (e.g., a 3 becomes a 2)
    // `ary[i - 1] = countEach[i - 1] + 1;` (e.g., a 2 count increases)
    // `ary[(i + 1) % 4] = countEach[(i + 1) % 4];`
    // `ary[(i + 2) % 4] = countEach[(i + 2) % 4];`
    // This is a bit convoluted. Let's trace `i=3`:
    // `ary[3] = countEach[3] - 1;`
    // `ary[2] = countEach[2] + 1;`
    // `ary[0] = countEach[0];` (since (3+1)%4 = 0)
    // `ary[1] = countEach[1];` (since (3+2)%4 = 1)
    // This is equivalent to `DP([countEach[0], countEach[1], countEach[2] + 1, countEach[3] - 1])`.
    // Let's trace `i=2`:
    // `ary[2] = countEach[2] - 1;`
    // `ary[1] = countEach[1] + 1;`
    // `ary[3] = countEach[3];` (since (2+1)%4 = 3)
    // `ary[0] = countEach[0];` (since (2+2)%4 = 0)
    // This is equivalent to `DP([countEach[0], countEach[1] + 1, countEach[2] - 1, countEach[3]])`.
    // Let's trace `i=1`:
    // `ary[1] = countEach[1] - 1;`
    // `ary[0] = countEach[0] + 1;`
    // `ary[2] = countEach[2];` (since (1+1)%4 = 2)
    // `ary[3] = countEach[3];` (since (1+2)%4 = 3)
    // This is equivalent to `DP([countEach[0] + 1, countEach[1] - 1, countEach[2], countEach[3]])`.

    // So, the `else` branch's loop effectively calculates the same sum as the `if` branch,
    // but only for the `i` values (1, 2, 3) that are present in `v`.
    // The `if (i === 0) continue;` ensures that transitions from `countEach[0]` are never considered in the loop.
    // This means the `if (v.length === 4)` condition is redundant. The `else` branch's loop covers all cases
    // where `countEach[1]`, `countEach[2]`, or `countEach[3]` are non-zero.
    // The `if` branch is just a hardcoded version of the loop for the specific case where all 1,2,3 counts are non-zero.
    // To maintain Type II, I must preserve this structural difference, even if it's logically redundant.

    if (nonZeroIndices.length === 4) { // This implies currentCounts[0], currentCounts[1], currentCounts[2], currentCounts[3] are all > 0
        expectedVal = 1 + (
            CalculateExpectedValue([currentCounts[0] + 1, currentCounts[1] - 1, currentCounts[2], currentCounts[3]], totalNonZeroItems, memoizationCache) * currentCounts[1] +
            CalculateExpectedValue([currentCounts[0], currentCounts[1] + 1, currentCounts[2] - 1, currentCounts[3]], totalNonZeroItems, memoizationCache) * currentCounts[2] +
            CalculateExpectedValue([currentCounts[0], currentCounts[1], currentCounts[2] + 1, currentCounts[3] - 1], totalNonZeroItems, memoizationCache) * currentCounts[3]
        ) / totalNonZeroItems;
        expectedVal /= (1 - currentCounts[0] / totalNonZeroItems);
    } else {
        expectedVal = 0;
        for (let index of nonZeroIndices) {
            if (index === 0) continue; // Skip transitions from 0-hit items

            let nextCounts = new Array(4); // Create a new array for the next state
            // Initialize with current counts to avoid issues with modulo arithmetic for indices
            nextCounts[0] = currentCounts[0];
            nextCounts[1] = currentCounts[1];
            nextCounts[2] = currentCounts[2];
            nextCounts[3] = currentCounts[3];

            // Apply the transition: an item with 'index' hits becomes an item with 'index - 1' hits.
            nextCounts[index]--;
            nextCounts[index - 1]++;

            expectedVal += CalculateExpectedValue(nextCounts, totalNonZeroItems, memoizationCache) * currentCounts[index];
        }
        expectedVal = (expectedVal / totalNonZeroItems) + 1;
        expectedVal /= (1 - currentCounts[0] / totalNonZeroItems);
    }

    // Memoize the calculated result before returning.
    memoizationCache[currentCounts[0]][currentCounts[1]][currentCounts[2]] = expectedVal;
    return expectedVal;
}

/**
 * Returns an array containing the indices of non-zero elements in the input array.
 * @param {number[]} inputArray - The array to check.
 * @returns {number[]} An array of indices where elements are not zero.
 */
function getNonZeroIndices(inputArray) {
    let resultIndices = [];
    for (let idx = 0; idx < inputArray.length; idx++) {
        if (inputArray[idx] !== 0) {
            resultIndices.push(idx);
        }
    }
    return resultIndices;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
