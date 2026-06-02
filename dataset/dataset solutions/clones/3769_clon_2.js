function ProcessInput(inputVal) {
    // Ensure the input value is treated as an integer.
    inputVal |= 0;

    // Define an array of precomputed values used in the calculation.
    // These specific numbers are crucial for the algorithm's logic.
    var powerList = [1, 6, 9, 36, 81, 216, 729, 1296, 6561, 7776, 46656, 59049];

    // Initialize a variable to store the minimum number of operations found.
    // It's set to a very large integer initially to ensure any valid count will be smaller.
    var minOperations = 1 << 29; // Represents a large positive integer.

    // Initiate the recursive search for the minimum operations.
    // The parameters are: current operations count (starting at 0),
    // the value to reduce (inputVal), and the starting index in powerList (11).
    calculateMin(0, inputVal, 11);

    // This nested function performs a recursive depth-first search
    // to find the minimum number of operations to reduce 'remainingVal' to zero or less.
    // currentOps: The count of operations performed so far in the current path.
    // remainingVal: The value that still needs to be reduced.
    // currentIndex: The index in 'powerList' from which to consider elements.
    function calculateMin(currentOps, remainingVal, currentIndex) {
        // Base case: If the remaining value is non-positive, a solution path has been found.
        if (remainingVal <= 0) {
            // If the current path's operation count is better than the best found so far, update it.
            if (currentOps < minOperations) {
                minOperations = currentOps;
            }
        }
        // Pruning condition: Only proceed if the current path's operation count
        // is potentially better than the best minimum found so far.
        else if (currentOps < minOperations) {
            // Adjust the currentIndex to find the largest element in 'powerList'
            // that is less than or equal to the 'remainingVal'.
            while (powerList[currentIndex] > remainingVal) {
                currentIndex--;
            }

            // Recursive call 1: Explore the path using the element at the current 'currentIndex'.
            // Increment operations, subtract the element, and keep the same index for potential reuse.
            calculateMin(currentOps + 1, remainingVal - powerList[currentIndex], currentIndex);

            // Recursive call 2: If there's a smaller element available (index > 1),
            // explore an alternative path using the element at 'currentIndex - 1'.
            // This allows for trying different combinations of elements.
            if (currentIndex > 1) {
                calculateMin(currentOps + 1, remainingVal - powerList[currentIndex - 1], currentIndex - 1);
            }
        }
    }

    // After the recursive search completes, print the globally found minimum operations.
    console.log(minOperations);
}

// Read the input from standard input, convert it to a string, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
