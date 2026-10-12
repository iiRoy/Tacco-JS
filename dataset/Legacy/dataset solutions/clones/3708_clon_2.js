function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    const dataLines = rawData.split('\n');

    // Parse the first line to get the total number of elements.
    const countElements = parseInt(dataLines[0]);

    // Parse the second line, split by spaces, and convert each part to an integer.
    const numericArray = dataLines[1].split(' ').map(val => parseInt(val));

    // Calculate the prefix sums (cumulative sums) of the numeric array.
    // This allows for efficient calculation of sums of sub-arrays.
    let currentSum = 0;
    const prefixSums = numericArray.map((element) => {
        currentSum += element;
        return currentSum;
    });

    // Initialize four arrays to store the sums of the four partitions (P, Q, R, S).
    const leftPart1 = []; // Corresponds to P in the original problem
    const leftPart2 = []; // Corresponds to Q in the original problem
    const rightPart1 = []; // Corresponds to R in the original problem
    const rightPart2 = []; // Corresponds to S in the original problem

    // --- First pass: Determine optimal P and Q partitions for each possible split point ---
    // 'currentIdx' represents the split point between the second (Q) and third (R) partitions.
    // 'leftPtr' represents the split point between the first (P) and second (Q) partitions.
    for (let currentIdx = 1, leftPtr = 0; currentIdx < countElements - 2; ++currentIdx) {
        // 'currentLeftSum' is the sum of elements from index 0 up to 'currentIdx'.
        // This represents the sum of P and Q combined.
        const currentLeftSum = prefixSums[currentIdx];
        
        // Adjust 'leftPtr' to find the optimal split between P and Q.
        // The goal is to minimize the absolute difference between P and Q.
        // This loop continues as long as 'currentIdx' is at least 2, allowing 'leftPtr' to be adjusted.
        while (currentIdx >= 2) {
            // Calculate sums for P and Q with the current 'leftPtr'.
            const subLeft1 = prefixSums[leftPtr]; // Sum of P
            const subLeft2 = currentLeftSum - subLeft1; // Sum of Q

            // Calculate sums for P and Q if 'leftPtr' were incremented by one.
            const subLeft1Plus1 = prefixSums[leftPtr + 1]; // Sum of P if leftPtr++
            const subLeft2Plus1 = currentLeftSum - subLeft1Plus1; // Sum of Q if leftPtr++

            // If incrementing 'leftPtr' leads to a smaller or equal difference between P and Q,
            // then it's a better or equally good split, so we move 'leftPtr' forward.
            if (Math.abs(subLeft2Plus1 - subLeft1Plus1) <= Math.abs(subLeft2 - subLeft1)) {
                ++leftPtr;
            } else {
                // Otherwise, the current 'leftPtr' is the best for this 'currentIdx', so break.
                break;
            }
        }

        // Store the sums of the optimal P and Q for the current 'currentIdx'.
        leftPart1.push(prefixSums[leftPtr]);
        leftPart2.push(prefixSums[currentIdx] - prefixSums[leftPtr]);
    }

    // --- Second pass: Determine optimal R and S partitions for each possible split point ---
    // 'currentRightIdx' represents the split point between the second (Q) and third (R) partitions,
    // iterating backwards from the end.
    // 'rightPtr' is an offset used to find the split point between the third (R) and fourth (S) partitions.
    for (let currentRightIdx = countElements - 2, rightPtr = 1; currentRightIdx > 1; --currentRightIdx, ++rightPtr) {
        // 'segmentEndValue' is the sum of elements up to the end of the second partition (Q).
        const segmentEndValue = prefixSums[currentRightIdx - 1];
        // 'totalSum' is the sum of all elements in the original array.
        const totalSum = prefixSums[countElements - 1];

        // Adjust 'rightPtr' to find the optimal split between R and S.
        // The goal is to minimize the absolute difference between R and S.
        // This loop continues as long as 'currentRightIdx' is less than 'countElements - 2'.
        while (currentRightIdx < countElements - 2) {
            // Calculate sums for R and S with the current 'rightPtr'.
            const subRight2 = totalSum - prefixSums[currentRightIdx + rightPtr - 1]; // Sum of S
            const subRight1 = prefixSums[currentRightIdx + rightPtr - 1] - segmentEndValue; // Sum of R

            // Calculate sums for R and S if 'rightPtr' were decremented by one.
            const subRight2Prev = totalSum - prefixSums[currentRightIdx + rightPtr - 2]; // Sum of S if rightPtr--
            const subRight1Prev = prefixSums[currentRightIdx + rightPtr - 2] - segmentEndValue; // Sum of R if rightPtr--

            // If decrementing 'rightPtr' leads to a smaller or equal difference between R and S,
            // then it's a better or equally good split, so we move 'rightPtr' backward.
            if (Math.abs(subRight2Prev - subRight1Prev) <= Math.abs(subRight2 - subRight1)) {
                --rightPtr;
            } else {
                // Otherwise, the current 'rightPtr' is the best for this 'currentRightIdx', so break.
                break;
            }
        }

        // Store the sums of the optimal R and S for the current 'currentRightIdx'.
        // 'unshift' is used because the loop iterates backwards, but we want the results
        // in the same order as the 'leftPart1' and 'leftPart2' arrays.
        rightPart1.unshift(prefixSums[currentRightIdx + rightPtr - 1] - segmentEndValue);
        rightPart2.unshift(totalSum - prefixSums[currentRightIdx + rightPtr - 1]);
    }

    // --- Final pass: Calculate the overall minimum difference ---
    // Initialize 'minimumDifference' with a value that will be easily overwritten.
    let minimumDifference = -1;

    // Iterate through all corresponding sets of P, Q, R, S partitions.
    // The length of all four arrays (leftPart1, leftPart2, rightPart1, rightPart2) will be the same.
    for (let k = 0; k < leftPart1.length; ++k) {
        // For each set of four partitions, find the maximum and minimum sum among them.
        // Then calculate the difference between this maximum and minimum.
        const currentDifference = Math.max(leftPart1[k], leftPart2[k], rightPart1[k], rightPart2[k]) -
                                  Math.min(leftPart1[k], leftPart2[k], rightPart1[k], rightPart2[k]);
        
        // If this 'currentDifference' is the first one calculated, or if it's smaller
        // than the previously found 'minimumDifference', update 'minimumDifference'.
        if (minimumDifference < 0 || currentDifference < minimumDifference) {
            minimumDifference = currentDifference;
        }
    }

    // Output the final calculated minimum difference to the console.
    console.log(minimumDifference);
}

// Read the entire input from standard input (stdin) as a UTF-8 string,
// then pass it to the 'ProcessInput' function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
