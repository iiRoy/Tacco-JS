// This function processes the entire input data string.
function ProcessInput(rawData) {
    // The initial data string is first split by newline characters,
    // then the first line is selected, and finally that line is
    // split by space characters to obtain an array of string values.
    let parsedValues = rawData.split("\n")[0].split(" ");

    // The program calculates the maximum of two absolute differences:
    // 1. The absolute difference between the first and second elements.
    // 2. The absolute difference between the first and third elements.
    // This computed value is then output to the standard console.
    console.log(Math.max(Math.abs(parsedValues[0] - parsedValues[1]), Math.abs(parsedValues[0] - parsedValues[2])));
}

// The following line should not be altered. It handles reading
// input from standard input and passing it to the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
