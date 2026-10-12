var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting into lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop. Continues until a specific condition is met.
while (true) {
    // Extract the number of entries for the current block, converting it to a number.
    var count = Number(lineSegments.shift());

    // If the count is zero, it signifies the end of input, so break the loop.
    if (count === 0) {
        break;
    }

    // Get the first dependency line, split it by colon, and then process the second part.
    // The slice(0, -1) removes the trailing comma, and then it's split by comma.
    var initialDependencies = lineSegments.shift().split(":");
    initialDependencies = initialDependencies[1].slice(0, -1).split(",");

    // Initialize an object to store the dependency map.
    var dependencyMap = {};

    // Loop to populate the dependency map from the remaining lines in the current block.
    for (var idx = 0; idx < count - 1; idx++) {
        var currentLineParts = lineSegments.shift().split(":");
        // Store the dependency: key is the first part, value is the processed second part.
        dependencyMap[currentLineParts[0]] = currentLineParts[1].slice(0, -1).split(",");
    }

    // Initialize a variable to track the length of initialDependencies for loop termination.
    var previousLength = 0;

    // Loop to expand dependencies until no new dependencies are added.
    while (true) {
        // If the current length is the same as the previous length, no new dependencies were added.
        if (previousLength === initialDependencies.length) {
            break;
        }
        // Update the previous length to the current length.
        previousLength = initialDependencies.length;

        // Iterate over the current set of dependencies.
        initialDependencies.forEach(function(dependencyItem, itemIndex) {
            // Check if the current dependency item exists as a key in the dependency map.
            if (dependencyMap.hasOwnProperty(dependencyItem)) {
                // If it does, mark the current item for removal by setting it to an empty string.
                initialDependencies[itemIndex] = "";
                // Add its associated dependencies to the end of the list.
                initialDependencies.push(dependencyMap[dependencyItem]);
            }
        });
    }

    // Filter out the empty strings (marked for removal) from the dependencies list.
    initialDependencies = initialDependencies.filter(function(filteredItem) {
        return filteredItem !== "";
    });

    // Create an object to store unique dependencies (acting as a set).
    var uniqueDependencies = {};
    // Populate the uniqueDependencies object.
    initialDependencies.forEach(function(depKey) {
        uniqueDependencies[depKey] = true;
    });

    // Output the total count of unique dependencies.
    console.log(Object.keys(uniqueDependencies).length);
}
