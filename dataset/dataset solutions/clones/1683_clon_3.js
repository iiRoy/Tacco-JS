// This module orchestrates the parsing and structuring of raw input data.
function ProcessInputData(rawDataString) {
    // Split the entire input block into individual lines once for efficiency.
    const allInputLines = rawDataString.split("\n");
    
    // Attempt to parse the first line as the total count of data scenarios.
    const totalScenarioCountRaw = allInputLines[0];
    const actualScenarioCount = parseInt(totalScenarioCountRaw, 10);

    // Initialize an array to store all processed datasets, each representing a scenario.
    const structuredDataCollection = [];
    
    // 'cursorLineIndex' tracks the current line number being processed from 'allInputLines'.
    // It starts at 1 because the 0th line holds the total scenario count.
    let cursorLineIndex = 1;
    
    // 'currentIteration' can be used for internal tracking or specific scenario-based logic.
    let currentIteration = 0; 

    // Iterate through each expected data scenario.
    while (currentIteration < actualScenarioCount) {
        // The line at 'cursorLineIndex' indicates how many subsequent data lines belong to the current scenario.
        const linesForCurrentScenarioRaw = allInputLines[cursorLineIndex];
        const currentScenarioDataSize = parseInt(linesForCurrentScenarioRaw, 10);

        // Prepare an array to hold the individual data elements for the current scenario.
        const currentScenarioElements = [];
        
        // Advance the cursor to the first actual data line of the current scenario.
        cursorLineIndex++; 

        // Loop to extract and process each data line for the current scenario.
        for (let dataLineOffset = 0; dataLineOffset < currentScenarioDataSize; dataLineOffset++) {
            const rawDataSegment = allInputLines[cursorLineIndex + dataLineOffset];
            // Split the line by spaces and add it to the current scenario's collection.
            // Using .trim() and .filter(Boolean) for robust parsing, handling extra spaces.
            currentScenarioElements.push(rawDataSegment.trim().split(" ").filter(Boolean));
        }
        
        // Add the completed scenario's data to the overall collection.
        structuredDataCollection.push(currentScenarioElements);
        
        // Update the cursor to point to the start of the next scenario's size declaration.
        // This is (number of data lines collected) + (the line that declared the data lines count).
        cursorLineIndex += currentScenarioDataSize;
        currentIteration++; // Increment the scenario counter.
    }
    
    // Return the aggregated structured data.
    return structuredDataCollection;
}

// Entry point: Read data from standard input and initiate processing.
// This part of the code handles environment-specific input retrieval.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));