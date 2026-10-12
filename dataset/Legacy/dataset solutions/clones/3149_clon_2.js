const processInput = rawData => {
    // This function processes the raw input string.
    // It first cleans up the input by trimming whitespace and splitting it into lines.
    const parsedLines = rawData.trim().split('\n');

    // From the first line of input, it extracts the first space-separated token.
    // This token is expected to be a number, which will be used for a conditional check.
    const firstVal = parsedLines[0].split(" ")[0];
    let resultFlag; // Declare a variable to hold the final computed flag.

    // A conditional statement checks the value of 'firstVal'.
    // If 'firstVal' is numerically equal to 0, 'resultFlag' is set to 1.
    if (firstVal == 0) {
        resultFlag = 1;
    }
    // Otherwise (if 'firstVal' is not 0), 'resultFlag' is set to 0.
    else {
        resultFlag = 0;
    }

    // The final computed 'resultFlag' is then printed to the console.
    console.log(resultFlag);
};

// The program's execution starts here.
// It reads the entire content of the standard input file ("/dev/stdin") as a UTF-8 string.
// This raw string data is then passed to the 'processInput' function for handling.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
