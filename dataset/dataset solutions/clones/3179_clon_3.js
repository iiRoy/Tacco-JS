// This module encapsulates the primary logic for processing geographical coordinates and travel queries.
function ProcessCoordinates(rawDataInput) {
    // Break down the entire input string into an array of individual lines.
    const parsedLines = rawDataInput.split("\n");

    // The very first line contains critical configuration details.
    const configurationElements = parsedLines[0].split(" ");

    // Extract and convert the counts of different entities to numeric types.
    const numberOfSanctuaries = Number(configurationElements[0]); // Count of holy shrines
    const numberOfTemples = Number(configurationElements[1]);     // Count of sacred temples
    const numberOfTravelQueries = Number(configurationElements[2]); // Total number of travel path inquiries

    // Initialize an array to store the coordinate values for all sanctuaries.
    const sanctuaryLocations = [];
    // Loop through the input lines to collect sanctuary coordinates, starting from the second line.
    for (let currentLineIndex = 1; currentLineIndex <= numberOfSanctuaries; currentLineIndex++) {
        // Convert the string representation of the coordinate to a numerical value.
        sanctuaryLocations.push(Number(parsedLines[currentLineIndex]));
    }

    // Initialize an array to store the coordinate values for all temples.
    const templeLocations = [];
    // Loop through the input lines to collect temple coordinates, offset by the number of sanctuaries.
    for (let currentLineIndex = 1; currentLineIndex <= numberOfTemples; currentLineIndex++) {
        // Convert the string representation of the coordinate to a numerical value.
        templeLocations.push(Number(parsedLines[currentLineIndex + numberOfSanctuaries]));
    }

    // Begin processing each individual travel query.
    // The query lines start after the configuration, sanctuaries, and temples.
    for (let queryIteration = 1; queryIteration <= numberOfTravelQueries; queryIteration++) {
        // Determine the current query's starting point from the input data.
        const currentQueryOrigin = Number(parsedLines[queryIteration + numberOfSanctuaries + numberOfTemples]);

        // Set an initial very large value for the minimum path found for this query.
        // This ensures any calculated path will be smaller and correctly set as the minimum.
        let shortestJourneyCalculated = Number.MAX_SAFE_INTEGER;

        // Iterate over every possible sanctuary location.
        for (let sanctuaryIndex = 0; sanctuaryIndex < sanctuaryLocations.length; sanctuaryIndex++) {
            // For each sanctuary, iterate over relevant temple locations.
            // Note: The original logic dictates that the temple index starts from the current sanctuary index.
            // This specific constraint is preserved.
            for (let templeIndex = sanctuaryIndex; templeIndex < templeLocations.length; templeIndex++) {
                // Retrieve the precise coordinates for the chosen sanctuary and temple.
                const chosenSanctuaryPosition = sanctuaryLocations[sanctuaryIndex];
                const chosenTemplePosition = templeLocations[templeIndex];

                // Calculate the direct distance between the selected sanctuary and temple.
                const distanceBetweenSites = Math.abs(chosenSanctuaryPosition - chosenTemplePosition);

                // Determine the shortest travel segment from the query origin to either the sanctuary or the temple.
                const initialLegDistance = Math.min(
                    Math.abs(currentQueryOrigin - chosenSanctuaryPosition),
                    Math.abs(currentQueryOrigin - chosenTemplePosition)
                );

                // Sum the two segments to get the total path length for this specific combination.
                const totalPathLength = distanceBetweenSites + initialLegDistance;

                // Update the overall shortest journey if the current path is more efficient.
                if (totalPathLength < shortestJourneyCalculated) {
                    shortestJourneyCalculated = totalPathLength;
                }
            }
        }
        // Output the minimal travel distance found for the current query to standard output.
        console.log(shortestJourneyCalculated);
    }
}

// This section is standard boilerplate for competitive programming in JavaScript
// and should not be altered. It reads input from stdin and invokes the main processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));