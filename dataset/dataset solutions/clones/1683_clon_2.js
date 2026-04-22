/*
 * This function processes raw string input
 * to extract structured data.
 */
function ProcessInput(rawData) {
    // Determine the total number of test scenarios from the first line.
    const scenarioCount = rawData.split('\n')[0];

    // Initialize a collection to hold all processed camel datasets.
    const allCamelDatasets = [];

    // Set an initial pointer for navigating through the input lines.
    let currentLinePointer = 1;

    // A variable to track the current processing iteration, though not directly used in logic.
    let processingIteration = 1;

    // Iterate through each test scenario.
    for (let scenarioIndex = 0; scenarioIndex < scenarioCount; scenarioIndex++) {
        // Extract the count of camels for the current scenario.
        const camelsInThisScenario = rawData.split('\n')[currentLinePointer];

        // Create a temporary array to store the camels for the current scenario.
        const currentScenarioCamels = [];

        // Loop to parse each camel's data within the current scenario.
        for (let camelDataIndex = 0; camelDataIndex < camelsInThisScenario; camelDataIndex++) {
            // Split the line into individual data points and add to the current scenario's camels.
            currentScenarioCamels.push(rawData.split('\n')[currentLinePointer + camelDataIndex + 1].split(' '));
        }

        // Add the completed camel set for the current scenario to the main collection.
        allCamelDatasets.push(currentScenarioCamels);

        // Update the line pointer to the start of the next scenario's data.
        currentLinePointer = parseInt(currentLinePointer) + parseInt(camelsInThisScenario) + 1;
    }
}

// Invoke the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));