const processInput = (rawData) => {
    // Split the entire input string by newline characters to get individual lines.
    let inputLines = rawData.split("\n");

    // Parse the first line to extract the number of elements and the maximum allowed distance.
    const firstLineData = inputLines[0].split(" ");
    const elementCount = Number(firstLineData[0]); // Corresponds to N in the original
    const maximumDistance = Number(firstLineData[1]); // Corresponds to X in the original

    // Parse the second line to get an array of numerical length values.
    const segmentLengths = inputLines[1].split(" ").map((segmentVal) => Number(segmentVal)); // Corresponds to Ls in the original

    // Initialize a counter for the number of points (bounds) reached, starting at 1 for the origin.
    let pointCounter = 1; // Corresponds to boundSum in the original
    // Initialize the current accumulated travel distance.
    let currentAccumulatedDistance = 0; // Corresponds to distance in the original

    // Iterate through the segment lengths.
    // The loop continues as long as we haven't processed all elements and the current distance is within the maximum.
    for (let segmentIndex = 0; segmentIndex < elementCount; segmentIndex++) { // Corresponds to i in the original
        // Check if the accumulated distance has already met or exceeded the maximum allowed distance.
        if (currentAccumulatedDistance >= maximumDistance) {
            // If so, no further segments can be added, so exit the loop.
            break;
        }
        // Add the length of the current segment to the total accumulated distance.
        currentAccumulatedDistance += segmentLengths[segmentIndex];
        // Increment the point counter, as a new point has been reached or passed.
        pointCounter += 1;
    }

    // Output the final calculated number of points.
    console.log(pointCounter);
};

// Read the input from standard input using Node.js file system module and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
