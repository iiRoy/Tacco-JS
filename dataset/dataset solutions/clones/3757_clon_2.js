// This function processes all incoming data from the standard input stream.
function ProcessInputData(rawData) {
    // Split the entire input string into an array of individual lines.
    let dataRows = rawData.split("\n");

    // The very first line contains important configuration parameters.
    let configValues = dataRows[0].split(" ");

    // Parse the total count of data items from the first configuration value.
    let numItems = parseInt(configValues[0], 10);
    // Parse the limit for selecting top items from the second configuration value.
    let limitValue = parseInt(configValues[1], 10);

    // Extract the actual item data rows, skipping the configuration line.
    let itemDataRows = dataRows.slice(1, numItems + 1);

    // Perform an early exit if the limit for top items is zero, as no calculation is needed.
    if (limitValue === 0) {
        console.log(0); // Output zero directly.
        return; // Terminate function execution.
    }

    // Transform string item rows into arrays of numbers for further processing.
    const numericSegments = itemDataRows.map(
        (currentItemLine) => currentItemLine.split(" ").map(
            (numericString) => parseInt(numericString, 10)
        )
    );

    // Calculate the sum for each numeric segment, then sort these sums,
    // select a specified number of top sums, and finally sum those selected values.
    let computedTotal = numericSegments
        .map((singleSegment) =>
            // Sum all individual values within a single segment.
            singleSegment.reduce((currentAccumulator, individualValue) => currentAccumulator + individualValue, 0)
        )
        .sort((firstElement, secondElement) => {
            // Sort the sums in ascending order.
            return firstElement < secondElement;
        })
        .slice(0, limitValue) // Keep only the top 'limitValue' sums from the sorted list.
        .reduce((finalAccumulator, selectedValue) => finalAccumulator + selectedValue, 0); // Aggregate the sum of the selected top values.

    // Display the final calculated total.
    console.log(computedTotal);
}

// Do not modify the following section (it handles standard I/O and calls the main processing function).
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));