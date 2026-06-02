// This function processes the provided raw input string.
function ProcessInput(rawData) {
    // The input string is expected to contain two space-separated integers.
    // We split the input to get these two numerical values.
    const coords = rawData.split(' ');

    // Parse the first number as the upper limit for iteration (N).
    const upperBound = parseInt(coords[0], 10);
    // Parse the second number as the divisor value (k).
    const divisorVal = parseInt(coords[1], 10);

    // Initialize a counter to store the number of valid triplets found.
    let resultCount = 0;

    // Begin iterating for the first number in the triplet, 'firstNum' (original 'a').
    // It ranges from 1 up to and including 'upperBound'.
    for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
        // Calculate the initial value for 'secondNum' (original 'b').
        // This ensures 'secondNum' is within the range [1, divisorVal] if 'firstNum' is a multiple of 'divisorVal',
        // otherwise it's 'firstNum' modulo 'divisorVal'.
        let secondNum = firstNum % divisorVal;
        if (secondNum === 0) {
            secondNum = divisorVal; // If remainder is zero, use 'divisorVal' instead.
        }

        // Loop for the second number, 'secondNum', incrementing by 'divisorVal' in each step.
        while (secondNum <= upperBound) {
            // Calculate the initial value for 'thirdNum' (original 'c'), similar to 'secondNum'.
            let thirdNum = firstNum % divisorVal;
            if (thirdNum === 0) {
                thirdNum = divisorVal; // If remainder is zero, use 'divisorVal' instead.
            }

            // Loop for the third number, 'thirdNum', incrementing by 'divisorVal' in each step.
            while (thirdNum <= upperBound) {
                // Check the conditions for the current triplet (firstNum, secondNum, thirdNum).
                // All three pairwise sums must be perfectly divisible by 'divisorVal'.
                if (
                    (firstNum + secondNum) % divisorVal === 0 &&
                    (firstNum + thirdNum) % divisorVal === 0 &&
                    (thirdNum + secondNum) % divisorVal === 0
                ) {
                    // If all conditions are satisfied, increment the counter.
                    resultCount++;
                }
                // Move to the next possible value for 'thirdNum'.
                thirdNum += divisorVal;
            }
            // Move to the next possible value for 'secondNum'.
            secondNum += divisorVal;
        }
    }

    // Output the final calculated count of valid triplets to the console.
    console.log(resultCount);
}

// This line reads input from standard input and passes it to the main processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
