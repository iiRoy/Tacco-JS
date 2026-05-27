function ProcessInput(rawData) {
    // Split the input string by space to get the two boundary numbers.
    let parsedData = rawData.split(' ');

    // Parse the first number as the lower bound (A).
    let lowerBound = parseInt(parsedData[0], 10);
    // Parse the second number as the upper bound (B).
    let upperBound = parseInt(parsedData[1], 10);

    // Initialize a counter for palindromic numbers found within the range.
    let palindromeCount = 0;

    // Iterate through possible values for the first digit (a) of a 5-digit palindrome (abcba).
    // 'a' cannot be 0 for a 5-digit number, so it ranges from 1 to 9.
    for (let digitA = 1; digitA <= 9; digitA++) {
        // Iterate through possible values for the second digit (b).
        // 'b' can be any digit from 0 to 9.
        for (let digitB = 0; digitB <= 9; digitB++) {
            // Iterate through possible values for the third digit (c).
            // 'c' can be any digit from 0 to 9.
            for (let digitC = 0; digitC <= 9; digitC++) {
                // Construct the 5-digit palindrome 'abcba' using the digits.
                // The formula is 10000*a + 1000*b + 100*c + 10*b + a
                // Which simplifies to 10001*a + 1010*b + 100*c
                let currentNumber = (10001 * digitA) + (1010 * digitB) + (100 * digitC);

                // Check if the generated palindrome falls within the specified range [A, B].
                if (lowerBound <= currentNumber && currentNumber <= upperBound) {
                    // If it's within the range, increment the counter.
                    palindromeCount++;
                }
            }
        }
    }

    // Output the total count of palindromes found.
    console.log(palindromeCount);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
