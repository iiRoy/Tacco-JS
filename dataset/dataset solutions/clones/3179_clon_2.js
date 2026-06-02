// This function processes the entire input data provided as a string.
function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    // The first line will be lines[0], the second lines[1], and so on.
    let lines = rawData.split("\n");

    // Parse the first line to get the counts of shrines, temples, and queries.
    let initialCounts = lines[0].split(" ");
    let shrineCount = parseInt(initialCounts[0], 10); // Number of shrines
    let templeCount = parseInt(initialCounts[1], 10); // Number of temples
    let queryCount = parseInt(initialCounts[2], 10); // Number of queries

    // Populate an array with shrine locations.
    // Locations are read from subsequent lines.
    let shrineLocations = [];
    for (let k = 1; k <= shrineCount; k++) {
        shrineLocations.push(parseInt(lines[k], 10)); // Convert to number
    }

    // Populate an array with temple locations.
    // Locations follow the shrine locations in the input.
    let templeLocations = [];
    for (let k = 1; k <= templeCount; k++) {
        templeLocations.push(parseInt(lines[k + shrineCount], 10)); // Convert to number
    }

    // Process each query.
    for (let k = 1; k <= queryCount; k++) {
        // Get the current query's location.
        let currentQueryLocation = parseInt(lines[k + shrineCount + templeCount], 10);
        let minTravelDistance = null; // Initialize minimum travel distance for this query

        // Iterate through all possible shrine-temple pairs.
        for (let shrineIdx = 0; shrineIdx < shrineLocations.length; shrineIdx++) {
            for (let templeIdx = shrineIdx; templeIdx < templeLocations.length; templeIdx++) {
                // Retrieve the location of the current shrine and temple.
                let currentShrineLoc = shrineLocations[shrineIdx]; // Distance from west to shrine
                let currentTempleLoc = templeLocations[templeIdx]; // Distance from west to temple

                // Calculate the total travel distance for this specific shrine-temple combination.
                // This involves traveling between the shrine and temple, and then from the query location to one of them.
                let calculatedDistance = Math.abs(currentShrineLoc - currentTempleLoc) + Math.min(Math.abs(currentQueryLocation - currentShrineLoc), Math.abs(currentQueryLocation - currentTempleLoc));

                // Update the minimum travel distance if the current combination is better.
                if (minTravelDistance === null || calculatedDistance < minTravelDistance) {
                    minTravelDistance = calculatedDistance;
                }
            }
        }
        // Output the minimum travel distance found for the current query.
        console.log("%d", minTravelDistance);
    }
}

// Do not modify the following line. It reads input from standard input and calls the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
