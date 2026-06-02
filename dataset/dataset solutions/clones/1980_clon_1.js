function Main(input) {
    // Check if the input string contains the digit '7'
    if (input.split("").indexOf("7") >= 0) {
        // If '7' is found, print "Yes"
        console.log("Yes");
    else {
        // Otherwise, print "No"
        console.log("No");
    }
}

// Read input from standard input and call the Main function
// This part should not be modified.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));