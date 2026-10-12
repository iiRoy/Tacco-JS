function ProcessInput(rawData) {
    // This line splits the incoming raw string data by newline characters.
    // The result is an array where each element is a line from the input.
    let parsedLines = rawData.split('\n');

    /*
     * The original implementation included a commented-out debug line here:
     * // console.log(parsedLines);
     * We maintain the spirit of the original by keeping it commented.
     */

    // A conditional check is performed based on specific array elements.
    // It verifies if the first element is less than the sixth element,
    // AND if the fifth element is also less than the sixth element.
    if (parsedLines[0] < parsedLines[5] && parsedLines[4] < parsedLines[5]) {
        // If both conditions evaluate to true, a specific positive message is printed.
        console.log('Yay!');
    } else {
        // Otherwise, if either condition is false, a different message is displayed.
        console.log(':(');
    }
}

// The primary function `ProcessInput` is invoked here.
// It reads the content of standard input (`/dev/stdin`) as a UTF-8 string.
// The `require("fs")` call accesses the Node.js file system module.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
