function ProcessInput(rawData) {
    // Initialize counters for odd and even numbers
    let oddCount = 0;
    let evenCount = 0;

    // Split the raw input string into an array of lines
    const linesArray = rawData.split('\n');

    // The first line contains the count of numbers to process
    // The second line contains the space-separated numbers themselves
    const numbersAsString = linesArray[1].split(' ');

    // Loop through the numbers as specified by the count in the first line
    // The first element of linesArray (linesArray[0]) is implicitly converted to a number
    for (let idx = 0; idx < linesArray[0]; idx++) {
        // Convert the current string number to an integer and check its parity
        if (parseInt(numbersAsString[idx]) % 2 !== 0) {
            // If the number is odd, increment the odd counter
            oddCount++;
        } else {
            // If the number is even, increment the even counter
            evenCount++;
        }
    }

    // After processing all numbers, check the parity of the even numbers count
    if (evenCount % 2 !== 0) {
        // If the count of even numbers is odd, print "YES"
        console.log("YES");
    } else {
        // Otherwise (if the count of even numbers is even), print "NO"
        console.log("NO");
    }
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
