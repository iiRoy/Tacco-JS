// This function processes a given text input to determine a specific condition.
function processInput(inputString) {
    // Split the entire input string into individual lines.
    let linesArray = inputString.split("\n");

    // The first line typically contains a count, though it's not used in the core logic.
    const countElements = Number(linesArray[0]);

    // The second line contains space-separated numbers, which are parsed into an array of integers.
    let numberList = linesArray[1].split(" ").map(itemStr => Number(itemStr));

    // Sort the list of numbers in ascending order.
    numberList.sort((valA, valB) => (valA - valB));

    // Extract the largest value from the sorted list (which is the last element).
    const largestValue = numberList.pop();

    // Initialize a variable to accumulate the sum of the remaining numbers.
    let totalSum = 0;

    // Iterate through the remaining numbers in the list and add them to the total sum.
    numberList.forEach(currentNum => {
        totalSum += currentNum;
    });

    // A debug line that was commented out in the original, keeping it commented.
    // console.log([totalSum, largestValue]);

    // Compare the largest value with the sum of the other values.
    if (largestValue < totalSum) {
        console.log("Yes"); // Output "Yes" if the largest value is smaller than the sum.
    } else {
        console.log("No");  // Otherwise, output "No".
    }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
