const ProcessInput = (rawData) => {
    // The initial input array contains lines; we focus on the first line.
    // This line is expected to have space-separated values.
    let parsedData = rawData[0].split(' ');

    // Extract the individual components from the parsed string array.
    // These represent the divisor, the multiplier, and the total time.
    let firstVal = parsedData[0]; // Corresponds to 'a' in the original problem.
    let secondVal = parsedData[1]; // Corresponds to 'b' in the original problem.
    let timeLimit = parsedData[2]; // Corresponds to 't' in the original problem.

    // Calculate how many full intervals of 'firstVal' fit into 'timeLimit'.
    // Math.floor ensures we get an integer count.
    let resultCount = Math.floor(timeLimit / firstVal);

    // Compute the final output by multiplying the count by 'secondVal'.
    console.log(resultCount * secondVal);
};

// Read the entire content from standard input,
// decode it as UTF-8, and then split it into an array of lines.
// This array is then passed to our processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
