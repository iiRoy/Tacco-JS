function ProcessInput (rawData) {
    // Parse the raw input string into an array of numbers
    var numericValues = rawData.trim().split(/\s|\n/).map(Number);

    // Calculate differences for x and y coordinates
    deltaX = numericValues[2] - numericValues[0];
    deltaY = numericValues[3] - numericValues[1];

    // Compute and display the Euclidean distance
    console.log(Math.sqrt(deltaX * deltaX + deltaY * deltaY));
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
