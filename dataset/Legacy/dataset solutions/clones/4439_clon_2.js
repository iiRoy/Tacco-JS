function processInput(rawData) {
    // Split the raw input string into an array of lines.
    const linesArray = rawData.split("\n");

    // Parse the first line as the total number of elements.
    let totalElements = Number(linesArray[0]);

    // Split the second line into an array of strings, representing individual elements.
    const elementStrings = linesArray[1].split(" ");

    // Calculate half of the total elements.
    let halfCount = totalElements / 2;

    // Initialize counters for numbers divisible by 4 and odd numbers.
    let quadrupleCount = 0;
    let oddNumberCount = 0;

    // Iterate through each element string to categorize numbers.
    for (let idx = 0; idx < elementStrings.length; idx++) {
        // Convert the string element to a number for modulo operations.
        const currentElement = Number(elementStrings[idx]);

        // Check if the current number is divisible by 4.
        if (currentElement % 4 === 0) {
            quadrupleCount++; // Increment the count for numbers divisible by 4.
        } else if (currentElement % 2 === 1) {
            // Check if the current number is odd.
            oddNumberCount++; // Increment the count for odd numbers.
        }
    }

    // Determine the output based on the counts.
    if (halfCount < oddNumberCount) {
        // If half the total is less than the count of odd numbers.
        if (oddNumberCount - 1 <= quadrupleCount) {
            console.log("Yes"); // Output "Yes" under this condition.
        } else {
            console.log("No"); // Otherwise, output "No".
        }
    } else {
        // If half the total is not less than the count of odd numbers.
        if (oddNumberCount <= quadrupleCount) {
            console.log("Yes"); // Output "Yes" under this condition.
        } else {
            console.log("no"); // Otherwise, output "no" (lowercase).
        }
    }

    // The following lines were commented out in the original and remain so.
    // console.log(oddNumberCount);
    // console.log(quadrupleCount);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
