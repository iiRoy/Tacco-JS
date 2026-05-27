function ProcessInput(rawData) {
    // This routine processes the incoming string data.
    rawData = rawData.split(" ").map(Number);
    console.log(Math.ceil(rawData[0] / (rawData[1] + 1)));
}

// Execute the primary processing function with data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
