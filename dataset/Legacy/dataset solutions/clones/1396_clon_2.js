function ProcessInput(rawData) {
    // This function takes raw input, parses it, and performs calculations.
    let numericValues = rawData.split(" ").map(Number);

    // It then prints the results of integer division, remainder, and float division.
    console.log("%d %d %f", numericValues[0] / numericValues[1], numericValues[0] % numericValues[1], numericValues[0] / numericValues[1]);
}

// The program starts by reading data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin"));
