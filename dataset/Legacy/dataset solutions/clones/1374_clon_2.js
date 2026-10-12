function ProcessInput(rawData) {
    // Split the entire input string into an array of lines, using newline as a delimiter.
    let dataRows = rawData.split("\n");

    // Loop indefinitely until a specific termination condition is met.
    while (true) {
        // Extract the first line, split it by space, and convert parts to numbers.
        // This line typically contains two values: 'n' and 'x'.
        const numPair = dataRows.shift().split(" ").map(Number);

        // Assign the first number to 'upperBound' (n) and the second to 'targetSum' (x).
        let upperBound = numPair[0];
        let targetSum = numPair[1];

        // If 'upperBound' is 0, it signifies the end of input, so break the loop.
        if (upperBound === 0) {
            break;
        }

        // Initialize a counter for valid triplets found.
        let validTriplets = 0;

        // Outer loop: 'firstNum' iterates from 1 up to 'upperBound - 3'.
        // This ensures there are at least two distinct numbers greater than 'firstNum' available.
        for (let firstNum = 1; firstNum < upperBound - 2; firstNum++) {
            // Inner loop: 'secondNum' iterates from 'firstNum + 1' up to 'upperBound - 2'.
            // This ensures 'secondNum' is greater than 'firstNum' and leaves room for 'thirdNum'.
            for (let secondNum = firstNum + 1; secondNum < upperBound - 1; secondNum++) {
                // Calculate the potential 'thirdNum' such that firstNum + secondNum + thirdNum = targetSum.
                const thirdNum = targetSum - secondNum - firstNum;

                // Check if 'thirdNum' is valid:
                // 1. It must be greater than 'secondNum' (secondNum + 1 <= thirdNum).
                // 2. It must not exceed 'upperBound' (thirdNum <= upperBound).
                if (secondNum + 1 <= thirdNum && thirdNum <= upperBound) {
                    // If both conditions are met, increment the counter.
                    validTriplets++;
                }
            }
        }
        // Output the total count of valid triplets for the current set of 'n' and 'x'.
        console.log(validTriplets);
    }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
