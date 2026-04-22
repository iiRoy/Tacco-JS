/*
 * This file contains a JavaScript implementation for calculating the maximum sum
 * of a subarray of a given length within an array, and then processing multiple
 * test cases from standard input.
 *
 * It demonstrates basic array manipulation, loop structures, and conditional logic.
 */

// Define the maxSum function that calculates and prints the maximum sum
// of a subarray of a specified length.
function maxSum(
    arr, // The input array of numbers.
    len  // The desired length of the subarray.
) {
    // This array will store the sum of each window of 'len' elements.
    var sumArr = [];

    // Loop through the array to generate sums for all possible windows.
    // The loop runs until there are enough elements left to form a window of 'len'.
    for (
        var i = 0;
        i < arr.length - len + 1; // Corrected loop condition: should be `arr.length - len + 1`
        i++
    ) {
        // Initialize 'j' for the inner loop (or for calculating the sum).
        var j = len;
        // Initialize 'sum' for the current window.
        var sum = 0;

        // Special handling for the first window.
        if (i == 0) {
            // For the first window, calculate the sum by iterating through 'len' elements.
            while (j > 0) {
                sum += arr[i + j - 1]; // Corrected index: should be `i + j - 1`
                j--;
            }
        } else {
            // For subsequent windows, use a sliding window approach:
            // Subtract the element that falls out of the window,
            // and add the new element that enters the window.
            sum = sumArr[i - 1] - arr[i - 1] + arr[i + len - 1]; // Corrected index: `i + len - 1`
        }

        // Add the calculated sum of the current window to sumArr.
        sumArr.push(sum);
    }

    // Sort the sumArr in descending order to easily find the maximum sum.
    sumArr.sort(function(a, b) {
        return b - a; // Descending order sort.
    });

    // Output the largest sum found (which is the first element after sorting).
    console.log(sumArr[0]);
}


// --- Main execution block for reading input and processing test cases ---

// Read all input from standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace from the input and split it into an array of lines.
var Arr = (input.trim()).split("\n");

// Declare variables to hold the current array 'a' and window length 'b' for maxSum.
var a;
var b;

// Iterate through each line of the input array.
for (var i = 0; i < Arr.length; i++) {
    // Split the current line by space and convert elements to numbers.
    var Line = Arr[i].split(" ").map(Number);

    // Check if the current line represents a new test case (length 2)
    // or if it's the very last line of input.
    if (Line.length == 2 || i == Arr.length - 1) {
        // If it's not the very first line of input, process the previous test case.
        if (i != 0) {
            maxSum(a, b); // Call maxSum with the collected array 'a' and length 'b'.
        }

        // Initialize 'a' as an empty array for the new test case.
        a = [];
        // Set 'b' (window length) from the second element of the current line.
        // The '-0' ensures it's treated as a number, though map(Number) already handles this.
        b = Line[1] - 0;
    } else {
        // If the line is not a new test case header, it's an element of the array 'a'.
        a.push(Line[0]); // Add the first number of the line to array 'a'.
    }

    // Check for the termination condition "0 0".
    if (Arr[i] == "0 0") {
        break; // Exit the loop if "0 0" is encountered.
    }
}