function ProcessInput(dataString) {
    // Check if the provided string contains the specific sequence "AC"
    if (dataString.indexOf("AC") !== -1) {
        // If "AC" is found, output "Yes" to the console
        console.log("Yes");
    } else {
        // Otherwise, if "AC" is not found, output "No"
        console.log("No");
    }
}

// Read the entire content from standard input, decode it as UTF-8,
// and then pass it to our primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
