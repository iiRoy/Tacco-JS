function ProcessInput(rawData) {
    // Process the raw input string: trim whitespace, split into lines,
    // then split each line by space to get an array of string arrays.
    let parsedData = rawData.trim().split("\n").map(function(item) {
        return item.split(" ");
    });

    // Extract the two dimensions (height and width) from the first line of input.
    // Convert them from strings to base-10 integers.
    const heightVal = parseInt(parsedData[0][0], 10);
    const widthVal = parseInt(parsedData[0][1], 10);

    // Call the core computation function to find the minimum area difference.
    let finalResult = computeMinAreaDiff(heightVal, widthVal);

    // Output the calculated minimum difference to the console.
    console.log(finalResult);
}

// This function calculates the minimum possible difference between the largest
// and smallest areas when a rectangle of dimensions dimA x dimB is divided into three pieces.
function computeMinAreaDiff(dimA, dimB) {
    // Optimization: If either dimension is a multiple of 3, the rectangle can be
    // perfectly divided into three equal strips, resulting in a difference of 0.
    if (dimA % 3 === 0 || dimB % 3 === 0) {
        return 0;
    }

    // Initialize the minimum difference found so far with the total area.
    // This serves as an upper bound for the difference.
    let minDifference = dimA * dimB;

    // Variable to hold the difference calculated in the current iteration.
    let currentDiff;

    // Variable to store the difference from the previous iteration.
    // Used for an early exit optimization if differences start increasing.
    let previousDiff = minDifference;

    // First pass: Iterate through possible cut positions along one dimension (dimB).
    // This simulates cutting the rectangle into one strip of size dimA * idx,
    // and then splitting the remaining rectangle (dimA * (dimB - idx)) into two pieces
    // by cutting it horizontally.
    for (let idx = 0; idx <= dimB; idx++) {
        // Calculate the maximum area difference among the three pieces for the current cut.
        // The three pieces are:
        // 1. A strip of area `idx * dimA`.
        // 2. One part of the remaining area: `(dimB - idx) * Math.ceil(dimA / 2)`.
        // 3. The other part of the remaining area: `(dimB - idx) * Math.floor(dimA / 2)`.
        // The `Math.max` finds the largest difference between any two of these three areas.
        currentDiff = Math.max(
            Math.abs(idx * dimA - (dimB - idx) * Math.ceil(dimA / 2)),
            Math.abs(idx * dimA - (dimB - idx) * Math.floor(dimA / 2)),
            (dimA % 2) * (dimB - idx) // This term represents the difference between the two sub-pieces if dimA is odd.
        );

        // Update the overall minimum difference found.
        minDifference = Math.min(minDifference, currentDiff);

        // Early exit optimization: If the current difference is greater than the previous one,
        // it implies we've passed the optimal point for this type of cut, so we can stop.
        if (currentDiff > previousDiff) {
            break;
        }
        previousDiff = currentDiff;
    }

    // Second pass: Swap the dimensions (dimA and dimB) and repeat the process.
    // This covers the case where the initial cut is made along the other axis.
    [dimB, dimA] = [dimA, dimB];

    // Reset the previous difference for the new pass.
    previousDiff = dimA * dimB;

    // Repeat the loop with the swapped dimensions.
    for (let idx = 0; idx <= dimB; idx++) {
        currentDiff = Math.max(
            Math.abs(idx * dimA - (dimB - idx) * Math.ceil(dimA / 2)),
            Math.abs(idx * dimA - (dimB - idx) * Math.floor(dimA / 2)),
            (dimA % 2) * (dimB - idx)
        );
        minDifference = Math.min(minDifference, currentDiff);
        if (currentDiff > previousDiff) {
            break;
        }
        previousDiff = currentDiff;
    }

    // The final result is the minimum of all calculated differences,
    // also considering the possibility that the minimum difference could be
    // equal to one of the dimensions (e.g., for very thin rectangles).
    return Math.min(minDifference, dimA, dimB);
}

// Read the input from standard input (e.g., a file or piped data)
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
