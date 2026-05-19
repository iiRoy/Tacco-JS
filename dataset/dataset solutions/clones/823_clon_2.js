function ProcessInput(rawData) {
    // Split the incoming raw data string into an array of individual lines.
    let lines = rawData.split("\n");

    // Begin an indefinite loop to process each line of input.
    // The loop condition 'true' (represented by '1') means it will run forever
    // until an explicit 'break' statement is encountered within its body.
    for (let lineIndex = 0; true; lineIndex++) {
        // Parse the current line as an integer with base 10.
        // Initialize a counter variable to store the number of valid combinations found for the current number.
        let currentNum = parseInt(lines[lineIndex], 10);
        let resultCount = 0;

        // If the parsed number is 0, it signifies the end of input, so exit the loop.
        if (currentNum === 0) {
            break;
        }

        // Iterate through potential divisor candidates, starting from 2 up to (but not including) the current number.
        for (let divisorCandidate = 2; divisorCandidate < currentNum; divisorCandidate++) {
            // Calculate a temporary value based on the current number and the divisor candidate.
            // This specific formula (n - j * (j - 1) / 2) is crucial to the problem's logic.
            let tempVal = currentNum - divisorCandidate * (divisorCandidate - 1) / 2;

            // Check two conditions for the temporary value:
            // 1. It must be a positive number.
            // 2. It must be perfectly divisible by the current divisor candidate (i.e., no remainder).
            if (tempVal > 0 && tempVal % divisorCandidate === 0) {
                // If both conditions are met, increment the result counter.
                resultCount++;
            }
        }
        // After checking all divisor candidates for the current number, print the total count of valid combinations.
        console.log(resultCount);
    }
}

// Read the entire content of the standard input file synchronously as a UTF-8 string,
// then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
