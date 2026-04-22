// This section initializes the primary data source 'x' by reading from standard input.
// It uses the 'fs' module to read the file, decodes it as UTF-8,
// then processes the string by removing commas, trimming whitespace,
// and finally splitting it into an array of strings based on any whitespace.
x = require('fs').readFileSync('/dev/stdin', 'utf8').replace(/,/g, "").trim().split(/\s/);

// Declare an empty array named 'str2'. This array will store processed strings later.
var str2 = [];


// Initialize an empty string named 'str'. This variable will be used
// to build up parts of strings before they are potentially added to 'str2'.
let str = "";


// Begin a loop that iterates through each element of the 'x' array.
// The loop variable 'i' serves as the index for accessing elements.
for (let i = 0; i < x.length; i++) {
    // Check if the current element 'x[i]' contains a period ('.').
    // This is determined by comparing the length of the string after
    // removing all periods with its original length.
    if (x[i].replace(/\./g, "").length < x[i].length) {

        // If a period is found, log the current element for debugging or tracing purposes.
        console.log("x[i] : " + x[i]);

        // Further check if the length of the string (without periods) is between 3 and 6, inclusive.
        if (x[i].replace(/\./g, "").length >= 3 && x[i].replace(/\./g, "").length <= 6) {

            // If the period is found at the very end of the string.
            if (x[i].search(/\./) == x[i].length - 1) {
                // Remove the trailing period and append the result to 'str'.
                str += x[i].replace(/\./g, "");
                // Push the accumulated 'str' into the 'str2' array.
                str2.push(str);
            }
            // If the period is not at the end, or if there are multiple periods,
            // or if it's somewhere in the middle, just append the original string 'x[i]' to 'str'.
            else {
                str += x[i];
            }


        }
        // If the length condition (3 to 6 characters without periods) is not met for an element containing a period.
        else {
            // Reset the 'str' variable to an empty string.
            str = "";


        }
    }
    // This 'else if' block handles elements that do not contain any periods.
    // It checks if the length of the current element 'x[i]' is between 3 and 6, inclusive.
    else if (x[i].length >= 3 && x[i].length <= 6) {
        // If the condition is met, append the current element 'x[i]' followed by a space to 'str'.
        str += x[i] + " ";
    }
}

// Start a second loop to iterate through the 'str2' array.
// This loop uses a post-increment operator within the console.log call,
// meaning 'i' is incremented after its value is used for indexing.
for (let i = 0; i < str2.length;) {
    // Print each element of 'str2' to the console.
    console.log(str2[i++]);
}