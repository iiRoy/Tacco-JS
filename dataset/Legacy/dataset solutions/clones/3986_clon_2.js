function ProcessInputData(rawData) {
    // Extract the numerical range from the initial input string.
    // The first line of input contains two space-separated integers.
    let startNum = rawData[0].split(" ")[0] - 0; // Convert first part to number
    let endNum = rawData[0].split(" ")[1] - 0;   // Convert second part to number

    let palindromeCount = 0; // Initialize a counter for palindromic numbers

    // Iterate through each number within the specified range (inclusive).
    for (let currentNumber = startNum; currentNumber <= endNum; currentNumber++) {
        // Convert the current number to its string representation.
        // Then, split it into an array of individual character digits.
        let numDigits = currentNumber.toString().split("");

        // Check if the number is a palindrome:
        // Join the original digit array back to a string,
        // and compare it with the string formed by reversing the digit array and joining it.
        if (numDigits.join("") === numDigits.reverse().join("")) {
            palindromeCount++; // Increment the counter if it's a palindrome.
        }
    }
    // Output the total count of palindromic numbers found.
    console.log(palindromeCount);
}

// Read input from standard input, decode as UTF-8, and split by newlines.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
