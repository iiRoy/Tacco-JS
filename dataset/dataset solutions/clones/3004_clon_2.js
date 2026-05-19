// This function processes the raw input string
function ProcessInput(rawData) {
    // Split the entire input by newline characters
    let parsedData = rawData.split("\n");

    // Take the first line and split it by spaces
    parsedData = parsedData[0].split(" ");

    // Convert the string parts to numbers for calculations
    const intervalValue = Number(parsedData[0]); // Represents 'A' from original
    const biscuitCount = Number(parsedData[1]);  // Represents 'B' from original
    const maxTime = Number(parsedData[2]);       // Represents 'T' from original

    let currentCycle = 1; // Tracks the current multiple of 'A'
    let totalBiscuits = 0; // Accumulates the total number of biscuits

    // Iterate through time points, including a small buffer for floating point precision
    for (let currentTimePoint = 0; currentTimePoint <= (maxTime + 0.5); currentTimePoint++) {
        // Check if the current time point is a multiple of the interval value
        if (currentTimePoint === currentCycle * intervalValue) {
            totalBiscuits += biscuitCount; // Add biscuits for this interval
            currentCycle++;                // Move to the next interval cycle
        }
    }

    // Output the final calculated total of biscuits
    console.log(totalBiscuits);
}

// Do not modify the following line; it handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
