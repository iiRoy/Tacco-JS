// This function processes the incoming data received.
function ProcessInput(incomingData) {
    // The incoming data is split into an array of lines.
    incomingData = incomingData.split("\n");

    // The first element of the array is parsed as an integer.
    var firstNumericValue = parseInt(incomingData[0], 10);

    // A calculation is performed, and the result is output to the console.
    console.log('%d', (firstNumericValue + 1) / 2);
}

// The following line should not be altered; it manages reading from standard input and initiating the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
