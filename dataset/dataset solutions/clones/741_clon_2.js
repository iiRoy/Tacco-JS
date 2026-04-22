const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the incoming stream: trim whitespace and split into an array of individual text lines.
const lineCollection = (dataStream.trim()).split("\n");

// Initiate the primary processing cycle, which continues until an explicit termination signal is encountered.
while (true) {
    // Extract the numerical value representing the count of subsequent entries for the current test case.
    // The `- 0` implicitly converts the string to a number.
    let numEntries = lineCollection.shift() - 0;

    // Check for the termination condition: if the entry count is zero, exit the main loop.
    if (numEntries === 0) {
        break;
    }

    // Retrieve the initial data line, which specifies the starting set of active elements.
    // This line is parsed by splitting at the colon character.
    let initialData = lineCollection.shift().split(":");

    // Further refine the initial data: extract the second part, remove the last character (likely a closing bracket),
    // and then split by commas to get individual identifiers.
    initialData = initialData[1].substring(0, initialData[1].length - 1).split(",");

    // Create an object to function as a hash set, storing boolean indicators for active elements.
    const activeIndicators = {};

    // Populate the 'activeIndicators' set with elements identified in the 'initialData' array,
    // marking each of them as true (active).
    initialData.forEach(function (currentIdentifier) {
        activeIndicators[currentIdentifier] = true;
    });

    // Initialize an object to store element dependencies, where keys are elements and values are arrays of their dependents.
    const dependencyRelations = {};

    // Loop through the remaining lines to construct the full dependency graph.
    // The loop runs for 'numEntries - 1' times because the first entry was handled separately.
    for (let entryIndex = 0; entryIndex < numEntries - 1; entryIndex++) {
        // Parse each dependency line, splitting it into a parent element and its children.
        let parsedEntry = lineCollection.shift().split(":");
        // Store the dependency: the parent element maps to an array of its direct dependent elements.
        dependencyRelations[parsedEntry[0]] = parsedEntry[1].slice(0, -1).split(",");
    }

    // A variable to track the number of active elements from the previous iteration, used to detect stabilization.
    let previousActiveCount = 0;

    // Begin the propagation phase: iteratively expand the set of active elements until no new elements are activated.
    while (true) {
        // Compare the current number of active elements with the count from the last iteration.
        // If they are equal, it means no new elements were activated, and the set has stabilized.
        if (previousActiveCount === Object.keys(activeIndicators).length) {
            break; // Exit the propagation loop
        }

        // Update 'previousActiveCount' to the current size of the 'activeIndicators' set for the next comparison.
        previousActiveCount = Object.keys(activeIndicators).length;

        // Iterate over each element currently in the 'activeIndicators' set.
        for (let keyName in activeIndicators) {
            // Check if the current element ('keyName') has defined dependencies AND is currently marked as active (true).
            if (dependencyRelations.hasOwnProperty(keyName) && activeIndicators[keyName]) {
                // If both conditions are met, iterate through its dependent elements.
                dependencyRelations[keyName].forEach(function (dependentItem) {
                    // Mark each dependent element as active.
                    activeIndicators[dependentItem] = true;
                });
                // After propagating its activation, mark the current element as processed (false) to avoid redundant checks.
                activeIndicators[keyName] = false;
            }
        }
    }

    // Initialize a counter to tally the final number of truly active elements.
    let totalActiveItems = 0;

    // Iterate through the final state of 'activeIndicators' to count elements that are still marked as true.
    for (let itemStatus in activeIndicators) {
        if (activeIndicators[itemStatus]) {
            totalActiveItems++; // Increment the counter for each genuinely active item.
        }
    }

    // Output the computed total count of active items for the current test case.
    console.log(totalActiveItems);
}