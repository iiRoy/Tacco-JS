function processInput(inputString) {
    // Remove any newline characters and then split the input by space
    const [tempNStr, tempKStr] = inputString.replace(/\r?\n/g, "").split(" ");

    // Convert the extracted string values to numerical types
    const numVal = Number(tempNStr);
    const kVal = Number(tempKStr);

    // Evaluate a specific mathematical condition
    if (numVal + 1 - (kVal * 2) >= 0) {
        // If the condition holds true, print "YES" to the console
        console.log("YES");
    } else {
        // Otherwise, if the condition is false, print "NO"
        console.log("NO");
    }
}

// Read the entire content from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
