function ProcessInput(rawData) {
    // Process the raw string input into a structured array, splitting by newlines and spaces.
    rawData = rawData
        .trim()
        .split("\n")
        .map(function(lineSegment) {
            return lineSegment.split(" ");
        });

    // Extract the total number of available components and the maximum duration allowed.
    let componentCount = parseInt(rawData[0][0], 10);
    let maxDuration = parseInt(rawData[0][1], 10);

    // Initialize an array to hold the properties (weight, value) of each component.
    const componentSpecs = [];
    // Populate the component specifications from the parsed input data.
    for (let index = 0; index < componentCount; index++) {
        componentSpecs.push(rawData[index + 1].map(propPart => parseInt(propPart, 10)));
    }

    // Sort the components based on their 'value' property (second element) for processing.
    componentSpecs.sort((firstComp, secondComp) => firstComp[1] - secondComp[1]);

    // Initialize the dynamic programming table to store maximum values.
    let valueTable = [];
    let currentWeight, currentBenefit; // Variables to hold properties of the component being processed.

    // Add the initial row to the DP table, representing no components selected, all zeros.
    valueTable.push(Array.from({ length: maxDuration + 1 }, () => 0));

    // Iterate through each component to fill the DP table row by row.
    for (let componentIndex = 0; componentIndex < componentCount; componentIndex++) {
        valueTable.push([]); // Add a new row for the current component's calculations.
        currentWeight = componentSpecs[componentIndex][0]; // Get the weight of the current component.
        currentBenefit = componentSpecs[componentIndex][1]; // Get the value of the current component.

        // Iterate through all possible time capacities up to maxDuration.
        for (let currentCapacity = 0; currentCapacity < maxDuration + 1; currentCapacity++) {
            // Check if the current component's weight can fit into the current capacity.
            if (currentWeight <= currentCapacity) {
                // If it fits, decide whether including it yields a better result.
                // Compare the value without the current component vs. with it.
                if (valueTable[componentIndex][currentCapacity] >= valueTable[componentIndex][currentCapacity - currentWeight] + currentBenefit) {
                    valueTable[componentIndex + 1][currentCapacity] = valueTable[componentIndex][currentCapacity];
                } else {
                    valueTable[componentIndex + 1][currentCapacity] = valueTable[componentIndex][currentCapacity - currentWeight] + currentBenefit;
                }
            } else {
                // If the component is too heavy, it cannot be included.
                valueTable[componentIndex + 1][currentCapacity] = valueTable[componentIndex][currentCapacity];
            }
        }
    }

    // Backtrack through the DP table to identify which components were chosen.
    const chosenComponentIndices = [];
    let tempComponentCounter = componentCount;
    let remainingTimeForSelection = maxDuration - 1;

    // Main backtracking loop to determine selected components.
    selectionLoop:
    while (remainingTimeForSelection > 0) {
        // Inner loop to check individual components.
        while (true) {
            // If no more components to consider, exit the selection process.
            if (tempComponentCounter === 0) break selectionLoop;

            // If the value at the current state is the same as the state without the previous component,
            // then the previous component was not selected.
            if (valueTable[tempComponentCounter][remainingTimeForSelection] === valueTable[tempComponentCounter - 1][remainingTimeForSelection]) {
                tempComponentCounter--; // Move to the component before that.
            } else {
                // If values differ, the previous component (tempComponentCounter - 1) was included.
                chosenComponentIndices.push(tempComponentCounter - 1);
                // Deduct the weight of the selected component from the remaining time.
                remainingTimeForSelection -= componentSpecs[tempComponentCounter - 1][0];
                tempComponentCounter--; // Move to the next previous component.
                continue selectionLoop; // Restart the outer loop with updated remaining time.
            }
        }
    }

    // Remove the components that were identified as selected from the original list.
    // This effectively leaves the unselected components.
    for (const eliminatedIndex of chosenComponentIndices) {
        componentSpecs.splice(eliminatedIndex, 1);
    }

    // Calculate a potential alternative maximum value considering the last remaining component.
    let alternativeMaxVal = 0;
    if (componentSpecs.length > 0) {
        alternativeMaxVal = valueTable[componentCount][maxDuration - 1] + componentSpecs[componentSpecs.length - 1][1];
    }

    // Output the final maximum value, comparing the full capacity result with the alternative calculation.
    console.log(Math.max(valueTable[componentCount][maxDuration], alternativeMaxVal));
}

// Execute the primary function by reading input from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));