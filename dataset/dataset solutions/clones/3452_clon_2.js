// This function processes the entire input string provided.
function ProcessInput(rawData) {
    // The input string is first divided into an array of individual lines.
    let processedLines = rawData.split("\n");

    // Parse the first line to get the total number of locations.
    let firstLineParts = processedLines[0].split(" ");
    let numLocations = Number(firstLineParts[0]);

    // Parse the second line to extract the initial temperature and the target temperature.
    let secondLineParts = processedLines[1].split(" ");
    let initialTemp = Number(secondLineParts[0]); // The base temperature at zero altitude.
    let targetTemp = Number(secondLineParts[1]); // The desired temperature for comparison.

    // Parse the third line, which contains the height data for each location.
    let heightsData = processedLines[2].split(" ");

    // Calculate the temperature for the very first location (at index 0).
    let currentCalculatedTemp = Number(heightsData[0]);
    currentCalculatedTemp = initialTemp - currentCalculatedTemp * 0.006; // Apply the temperature lapse rate.

    // Initialize the variable to store the minimum absolute temperature difference found so far.
    let minimumAbsoluteDifference = Math.abs(currentCalculatedTemp - targetTemp);
    // Initialize the identifier for the location that currently has the closest temperature.
    let optimalLocationIdentifier = 1; // Locations are typically 1-indexed in problem statements.

    // Loop through the remaining locations, starting from the second one (index 1).
    for (let locationIterator = 1; locationIterator < numLocations; locationIterator++) {
        // Retrieve the height for the current location in the iteration.
        currentCalculatedTemp = Number(heightsData[locationIterator]);
        // Recalculate the temperature at this specific height.
        currentCalculatedTemp = initialTemp - currentCalculatedTemp * 0.006;

        // Compare the absolute difference of the current location's temperature with the target.
        if (minimumAbsoluteDifference > Math.abs(currentCalculatedTemp - targetTemp)) {
            // If the current location is closer, update the minimum difference.
            minimumAbsoluteDifference = Math.abs(currentCalculatedTemp - targetTemp);
            // And update the identifier of the optimal location.
            optimalLocationIdentifier = locationIterator + 1; // Adjust to 1-indexed.
        }
    }
    // Print the identifier of the location that has a temperature closest to the target.
    console.log(optimalLocationIdentifier);
}

// This section handles reading input from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
