/*
 * This module processes coordinate data from standard input.
 * It aims to find optimal pairings between two sets of points.
 */
console.log((inputStr => {
    // Parse the input string into a structured array of numbers.
    // The first line contains a single integer representing the number of data points.
    // Subsequent lines contain coordinate pairs.
    const allParsedData = inputStr
        .trim() // Remove any leading or trailing whitespace from the input.
        .split('\n') // Split the string into an array of lines.
        .map(lineStr => // For each line...
            lineStr.split(' ') // Split the line by spaces into string components.
                .map(valStr => parseInt(valStr, 10)) // Convert each string component to an integer.
        );


    // Extract the total number of items from the first line.
    // The rest of the lines are stored for further processing.
    const [[numItems], ...parsedLines] = allParsedData;


    // Initialize two arrays to store distinct sets of coordinates.
    const scarletSpots = []; // Stores the "red" points.
    const azureAreas = [];   // Stores the "blue" points.

    // Populate the coordinate arrays based on the 'numItems' value.
    // The first 'numItems' lines in 'parsedLines' go to 'scarletSpots',
    // and the next 'numItems' lines go to 'azureAreas'.
    for ( let pointIndex = 0; pointIndex < numItems; pointIndex++ )
    {
        scarletSpots.push(parsedLines[pointIndex]);
        azureAreas.push(parsedLines[numItems + pointIndex]);
    }

    // Sort both sets of points.
    // The sorting criterion is descending order based on the first coordinate (x-value).
    scarletSpots.sort(([firstCoordA], [firstCoordB]) => firstCoordB - firstCoordA);
    azureAreas.sort(([firstCoordA], [firstCoordB]) => firstCoordB - firstCoordA);

    // Initialize a counter for successful pairings.
    let matchCounter = 0;

    // Iterate through each blue point to find a suitable red point match.
    for ( let idxBlue = 0; idxBlue < numItems; idxBlue++ )
    {
        const [currentBlueX, currentBlueY] = azureAreas[idxBlue]; // Get coordinates of the current blue point.

        // 'bestMatchInfo' will store the index of the most suitable red point
        // and a specific y-coordinate value for comparison.
        // Initialized to an invalid state.
        let bestMatchInfo = [-1, -1];

        // Iterate through the available red points to find a potential match.
        for ( let idxRed = 0; idxRed < scarletSpots.length; idxRed++ )
        {
            let [potentialRedX, potentialRedY] = scarletSpots[idxRed]; // Get coordinates of the current red point.

            // Condition 1: The x-coordinate of the blue point must be greater than
            // the x-coordinate of the red point for a match to be possible.
            if ( currentBlueX < potentialRedX ) continue;

            // Condition 2: The y-coordinate of the blue point must be greater than
            // the y-coordinate of the red point.
            // Additionally, we are looking for the red point that maximizes the blue point's y-coordinate
            // among valid matches. (This is the exact logic preserved from the original code).
            if ( currentBlueY > potentialRedY && currentBlueY > bestMatchInfo[1] )
            {
                bestMatchInfo = [idxRed, currentBlueY]; // Update best match with index and blue's Y.
            }
        }

        // If a suitable red point was found (indicated by a non-negative y-value in bestMatchInfo).
        if ( bestMatchInfo[1] >= 0 )
        {
            // Remove the matched red point from the available pool to prevent re-matching.
            scarletSpots.splice(bestMatchInfo[0], 1);
            matchCounter++; // Increment the total count of successful pairings.
        }
    }

    // Return the final count of pairings as a string.
    return `${matchCounter}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read input from the standard input stream.