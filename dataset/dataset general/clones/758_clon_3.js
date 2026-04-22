module.exports.transformData = function(inputCollections) {
    // This function processes raw performance data, organizing it into a structured
    // format suitable for graphical representation, such as a scatter plot.
    // It also identifies the peak duration and magnitude across all data series.

    // --- Input Validation and Guard Clause ---
    // Ensure the input is a valid, non-empty array to prevent errors.
    if (!Array.isArray(inputCollections) || inputCollections.length === 0) {
        console.warn("Input data collections are invalid or empty. Returning a default, empty structure.");
        return {
            processedPoints: [],       // The main data grid for charting.
            maximumDuration: 0,        // The highest time value found.
            maximumMagnitude: 0        // The highest length/magnitude value found.
        };
    }

    // --- Initialization of Core Data Structures and Trackers ---
    // The primary output array, which will hold the header row and all data points.
    const dataPointsCollection = [];
    // Generate and add the header row, which typically includes 'Time' and series labels.
    dataPointsCollection.push(generateHeaderRow(inputCollections));

    // Initialize variables to keep track of the highest 'time' and 'length' values encountered.
    // Using 'let' as these values will be updated iteratively.
    let maximumDuration = 0;
    let maximumMagnitude = 0;

    // Cache the number of input collections. This value is used repeatedly in nested loops
    // to determine the width of the output data rows, optimizing performance slightly.
    const seriesCount = inputCollections.length;

    // --- Main Data Processing Loop ---
    // Iterate over each individual collection of data provided.
    // The 'outerIndex' tracks which series we are currently processing.
    inputCollections.forEach((currentCollectionItem, outerIndex) => {
        // --- Inner Collection Validation ---
        // Verify that the current collection item is valid and contains a 'data' array.
        // This prevents crashes if a collection item is malformed.
        if (!currentCollectionItem || !Array.isArray(currentCollectionItem.data)) {
            console.warn(`Collection item at index ${outerIndex} is missing a 'data' array or is invalid. Skipping this series.`);
            return; // Move to the next item in the inputCollections array.
        }

        const currentDataSet = currentCollectionItem.data; // Extract the actual array of data points.

        // --- Data Point Iteration ---
        // Loop through each individual data point within the current data set.
        currentDataSet.forEach(singlePointEntry => {
            // --- Data Point Structure Validation ---
            // Ensure the data point has the expected 'time' and 'length' properties, and that they are numbers.
            if (typeof singlePointEntry.time !== 'number' || typeof singlePointEntry.length !== 'number') {
                console.warn(`Skipping malformed data point: ${JSON.stringify(singlePointEntry)}. Expected 'time' and 'length' as numbers.`);
                return; // Skip this specific data point and move to the next.
            }

            // Extract the duration and magnitude for the current point for clarity.
            const pointDuration = singlePointEntry.time;
            const pointMagnitude = singlePointEntry.length;

            // --- Update Global Maximums ---
            // Use Math.max to efficiently update the overall maximum duration and magnitude.
            maximumDuration = Math.max(maximumDuration, pointDuration);
            maximumMagnitude = Math.max(maximumMagnitude, pointMagnitude);

            // --- Constructing a Single Output Data Row ---
            // Each output row represents a single observation across all series.
            // It starts with the observed duration.
            const currentRow = [ pointDuration ];

            // Populate the rest of the row with magnitude values.
            // This loop creates a sparse row: only the column corresponding to the
            // current series (outerIndex) will contain the actual magnitude;
            // all other series columns for this specific observation will be 'null'.
            for (let columnIndex = 0; columnIndex < seriesCount; columnIndex++) {
                currentRow.push(columnIndex === outerIndex ? pointMagnitude : null);
            }

            // Add the newly constructed row to our main collection of data points.
            dataPointsCollection.push(currentRow);
        });
    });

    // --- Final Result Object Construction ---
    // Return an object containing the processed data grid and the calculated maximums.
    return {
        processedPoints: dataPointsCollection,
        maximumDuration: maximumDuration,
        maximumMagnitude: maximumMagnitude
    };
};

// --- Helper Function: Header Row Generation ---
// This function creates the initial row for the data grid, serving as column headers
// or a legend for the scatter plot.
function generateHeaderRow(dataSources) {
    // The first element is typically the label for the independent variable (e.g., time).
    const headerLabels = [ 'Elapsed Time' ]; // Renamed for more descriptive context.

    // Map through each data source to extract its label, providing a fallback if missing.
    const seriesLabels = dataSources.map(source => source.label || `Unnamed Series ${Math.random().toFixed(4).substring(2)}`);

    // Use the spread operator to efficiently append all generated series labels to the header.
    headerLabels.push(...seriesLabels);

    return headerLabels;
}