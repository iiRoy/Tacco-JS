function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    let parsedLines = rawData.split("\n");

    // The first line typically contains the number of elements to process.
    const countElements = parsedLines[0];

    // The second line contains space-separated numeric values; parse them into an array of integers.
    let dataArray = parsedLines[1].split(" ").map(elementStr => parseInt(elementStr, 10));

    // Initialize a variable to keep track of the count of odd numbers.
    let oddCount = 0;

    // Loop through the array of numbers from the input.
    for (let idx = 0; idx < countElements; idx++) {
        // Use a bitwise AND operation to check if the current number is odd.
        // If the least significant bit is 1, the number is odd.
        if (dataArray[idx] & 1) {
            oddCount++; // Increment the counter for odd numbers.
        }
    }

    // Determine the final output message based on whether the total count of odd numbers is itself odd or even.
    // If oddCount is odd, the result is "NO"; otherwise, it's "YES".
    const resultMessage = (oddCount & 1) ? "NO" : "YES";

    // Print the final result to the standard output.
    console.log(resultMessage);
}

// Read the entire content from standard input, decode it as UTF-8, and remove leading/trailing whitespace.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
