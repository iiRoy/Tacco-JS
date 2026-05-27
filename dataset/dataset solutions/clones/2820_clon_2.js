function processInput(rawData) {
    // This function takes raw string input, processes it, and prints a result.
    // It first trims whitespace, splits the string by spaces, and converts parts to integers.
    let parsedNumbers = rawData.trim().split(' ').map(numStr => parseInt(numStr, 10));

    // Based on a comparison of the first two parsed numbers, it logs either 10 or 0.
    console.log(parsedNumbers[0] >= parsedNumbers[1] ? 10 : 0);
}

// The program starts by reading data from standard input using Node.js file system module.
// The read data is then passed to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
