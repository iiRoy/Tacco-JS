var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input
var lineBuffer = (rawData.trim()).split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

while (true) { // Main processing loop, continues until a specific condition is met
    var numEntries = lineBuffer.shift() - 0; // Get the number of entries for the current test case, converting to number

    if (numEntries === 0) { // If the number of entries is zero, it signifies the end of input
        break; // Exit the main processing loop
    }

    var initialDeps = lineBuffer.shift().split(":"); // Get the first dependency line and split it by colon
    initialDeps = initialDeps[1].slice(0, -1).split(","); // Extract the dependencies part, remove the trailing dot, and split by comma

    var dependencyTracker = {}; // Initialize an object to track active dependencies
    initialDeps.forEach(function(dependencyItem) { // Populate the tracker with initial dependencies
        dependencyTracker[dependencyItem] = true; // Mark each initial dependency as active
    });

    var dependencyMap = {}; // Initialize an object to store the dependency relationships
    for (var idx = 0; idx < numEntries - 1; idx++) { // Loop through the remaining dependency lines
        var currentLineParts = lineBuffer.shift().split(":"); // Get the current line and split it by colon
        dependencyMap[currentLineParts[0]] = currentLineParts[1].slice(0, -1).split(","); // Store the dependencies for the current key
    }

    var previousCount = 0; // Initialize a counter for the number of active dependencies in the previous iteration
    while (true) { // Loop to resolve dependencies until no new dependencies are activated
        if (previousCount === Object.keys(dependencyTracker).length) { // If the count of active dependencies hasn't changed
            break; // Exit the dependency resolution loop
        }

        previousCount = Object.keys(dependencyTracker).length; // Update the previous count with the current number of active dependencies

        for (var currentKey in dependencyTracker) { // Iterate over all known dependencies
            // Check if the current key has sub-dependencies defined and is currently active
            if (dependencyMap.hasOwnProperty(currentKey) && dependencyTracker[currentKey]) {
                dependencyMap[currentKey].forEach(function(dependencyItem) { // For each sub-dependency
                    dependencyTracker[dependencyItem] = true; // Mark it as active
                });
                dependencyTracker[currentKey] = false; // Deactivate the current key after processing its sub-dependencies
            }
        }
    }

    var finalCount = 0; // Initialize a counter for the final number of unique active dependencies
    for (var currentKey in dependencyTracker) { // Iterate through all tracked dependencies
        if (dependencyTracker[currentKey]) { // If a dependency is still marked as active (meaning it was added but not yet processed as a parent)
            finalCount++; // Increment the final count
        }
    }

    console.log(finalCount); // Output the total count of unique active dependencies for the current test case
}
