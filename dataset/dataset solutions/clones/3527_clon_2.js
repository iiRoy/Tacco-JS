function ProcessInput(rawData) {
    // This function processes raw input data to determine a "war" condition.
    // The input is expected to be a multi-line string.

    // Split the entire input string into an array of individual lines.
    let dataLines = rawData.split("\n");

    // Parse the first line, which contains N, M, X, Y values.
    let firstLineParts = dataLines[0].split(" ");

    // Parse the second line, containing X coordinates.
    let xCoordinates = dataLines[1].split(" ");

    // Parse the third line, containing Y coordinates.
    let yCoordinates = dataLines[2].split(" ");

    // Convert string parts to integers for initial parameters.
    const countN = parseInt(firstLineParts[0], 10); // Number of X values
    const countM = parseInt(firstLineParts[1], 10); // Number of Y values
    const initialX = parseInt(firstLineParts[2], 10); // Initial X boundary
    const initialY = parseInt(firstLineParts[3], 10); // Initial Y boundary

    // Initialize variables to track the maximum X and minimum Y values.
    let maximumX = initialX;
    let minimumY = initialY;

    // Iterate through the X coordinates to find the true maximum X.
    for (const currentXVal of xCoordinates) {
        // Convert the current string value to an integer for comparison.
        if (parseInt(currentXVal, 10) > parseInt(maximumX, 10)) {
            maximumX = currentXVal; // Update maximumX if a larger value is found.
        }
    }

    // Iterate through the Y coordinates to find the true minimum Y.
    for (const currentYVal of yCoordinates) {
        // Convert the current string value to an integer for comparison.
        if (parseInt(currentYVal, 10) < parseInt(minimumY, 10)) {
            minimumY = currentYVal; // Update minimumY if a smaller value is found.
        }
    }

    // Determine the outcome based on the final maximum X and minimum Y values.
    // If the minimum Y is less than or equal to the maximum X, it's "War".
    if (parseInt(minimumY, 10) <= parseInt(maximumX, 10)) {
        console.log('War');
    } else {
        // Otherwise, it's "No War".
        console.log('No War');
    }
}

// The following line handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
