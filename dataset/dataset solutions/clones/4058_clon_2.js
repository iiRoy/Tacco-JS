var ProductionMode = function () {
    /* This function provides a mechanism
     * to read input in a production environment. */
    var fileSystemModule = require('fs');
    var readStandardInput = function (optionalPrompt) {
        // If a prompt message is provided, display it.
        if (optionalPrompt) {
            console.log(optionalPrompt);
        }
        // Read content from standard input synchronously.
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };
    return readStandardInput; /* Return the input reading function. */
};

/* A flag to determine if the application is running in a test mode. */
var isTestRun = false;

/* Initialize the input fetcher based on the run mode.
 * (Assuming a TestModeSupplier function exists for isTestRun = true,
 * though not explicitly defined here, it maintains the structure.) */
var inputFetcher = isTestRun ? TestModeSupplier() : ProductionMode();

// Obtain all raw lines from the input source, splitting by newline characters.
var rawInputLines = inputFetcher().split('\n');

/* Parse the first line to get the primary dimensions (N and M). */
var dimensionsArray = rawInputLines.shift().split(' ').map(val => parseInt(val, 10));

// Extract the number of rows and columns from the parsed dimensions.
var rowCount = dimensionsArray[0];
var colCount = dimensionsArray[1];

/* Process the subsequent input lines to form constraint records.
 * Only consider 'colCount' number of lines after the first. */
var constraintRecords = rawInputLines.filter((lineItem, lineIndex) => lineIndex < colCount).map(lineItem => lineItem.split(' ').map(numericValue => parseInt(numericValue, 10)));

/* Initialize a boolean flag to track the overall consistency of the graph.
 * True indicates consistent, false indicates inconsistent. */
var isGraphConsistent = true;

// Iterate through each constraint, processing them in reverse order using pop().
for (var constraintIdx = 0; constraintIdx < colCount; constraintIdx++) {
    /* Retrieve the last constraint tuple from the records array. */
    var currentTuple = constraintRecords.pop();

    /* Deconstruct the constraint tuple into its components:
     * firstNode (L), secondNode (R), and edgeWeight (D). */
    var firstNode = currentTuple[0];
    var secondNode = currentTuple[1];
    var edgeWeight = currentTuple[2];

    /* First block of consistency checks:
     * Find existing constraints where the first element matches 'firstNode'. */
    var nodesStartingWithFirst = constraintRecords.filter(item => item[0] === firstNode);

    // Iterate through these filtered constraints to check for inconsistencies.
    for (var startNodeIdx = 0; startNodeIdx < nodesStartingWithFirst.length; startNodeIdx++) {
        var relatedStartNode = nodesStartingWithFirst[startNodeIdx];

        /* Identify inconsistent paths originating from 'relatedStartNode'.
         * This involves checking for specific patterns (relatedStartNode[1] -> secondNode or secondNode -> relatedStartNode[1])
         * where the combined weights do not match 'edgeWeight'. */
        var inconsistentStartPaths = constraintRecords.filter(item => item[0] === relatedStartNode[1] && item[1] === secondNode).concat(
            constraintRecords.filter(item => item[1] === relatedStartNode[1] && item[0] === secondNode)
        ).filter(item => (relatedStartNode[2] + item[2] - edgeWeight) !== 0);

        // If any inconsistent paths are found, the graph is inconsistent.
        if (inconsistentStartPaths.length > 0) {
            isGraphConsistent = false;
            break; // Exit the inner loop.
        }
    }
    /* If an inconsistency was detected, no further checks are needed. */
    if (!isGraphConsistent) {
        break; // Exit the main loop.
    }


    /* Second block of consistency checks:
     * Find existing constraints where the second element matches 'firstNode'. */
    var nodesEndingWithFirst = constraintRecords.filter(item => item[1] === firstNode);

    // Iterate through these filtered constraints.
    for (var endNodeIdx = 0; endNodeIdx < nodesEndingWithFirst.length; endNodeIdx++) {
        var relatedEndNode = nodesEndingWithFirst[endNodeIdx];

        /* Identify inconsistent paths using the same logic as the first block,
         * but considering 'relatedEndNode[0]' as the connecting point. */
        var inconsistentEndPaths = constraintRecords.filter(dataPoint => dataPoint[0] === relatedEndNode[0] && dataPoint[1] === secondNode).concat(
            constraintRecords.filter(dataPoint => dataPoint[1] === relatedEndNode[0] && dataPoint[0] === secondNode)
        ).filter(dataPoint => (relatedEndNode[2] + dataPoint[2] - edgeWeight) !== 0);

        // If any inconsistencies are found, mark the graph as inconsistent.
        if (inconsistentEndPaths.length > 0) {
            isGraphConsistent = false;
            break; // Exit the inner loop.
        }
    }
    // If an inconsistency was detected, exit the main loop.
    if (!isGraphConsistent) {
        break;
    }
}

// Output the final consistency status.
console.log(isGraphConsistent ? 'Yes' : 'No');