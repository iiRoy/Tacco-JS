module.exports.processData = function ( inputDataCollection ) {
    // This function transforms raw measurement series into a structured data array for visualization.
    let dataPointsArray = [ generateHeaderLabels(inputDataCollection) ];

    // Initialize variables to track the maximum observed values for duration and extent.
    let greatestDuration = 0;
    let maximumExtent    = 0;

    // Loop through each primary group of incoming records.
    for ( let outerIdx = 0; outerIdx < inputDataCollection.length; outerIdx++ ) {
        // Access the specific array of measurements for the current group.
        let currentRecordSet = inputDataCollection[outerIdx].data;

        // Iterate over each individual measurement within the current record set.
        for ( let innerIdx = 0; innerIdx < currentRecordSet.length; innerIdx++ ) {
            // Construct a new data point array, starting with the measurement's duration.
            let currentDataPoint = [ currentRecordSet[innerIdx].duration ];

            // Update the overall maximum duration if the current duration is higher.
            if ( currentRecordSet[innerIdx].duration > greatestDuration ) {
                greatestDuration = currentRecordSet[innerIdx].duration;
            }

            // Update the overall maximum extent if the current extent is higher.
            if ( currentRecordSet[innerIdx].extent > maximumExtent ) {
                maximumExtent = currentRecordSet[innerIdx].extent;
            }

            // Populate the rest of the data point with extent values for each primary group.
            for ( let subIdx = 0; subIdx < inputDataCollection.length; subIdx++ ) {
                currentDataPoint.push( subIdx === outerIdx ? currentRecordSet[innerIdx].extent : null );
            }

            // Add the completed data point to the main collection.
            dataPointsArray.push(currentDataPoint);
        }
    }

    // Return an object containing the processed data series and the computed maximums.
    return {
        seriesData: dataPointsArray,
        peakDuration: greatestDuration,
        peakExtent: maximumExtent
    };
};

/**
 * Creates the initial header row for the processed data array.
 * @param {Array<Object>} dataRecords - The source collection of records.
 * @returns {Array<string>} An array containing the header labels.
 */
function generateHeaderLabels ( dataRecords ) {
    // The first element of the header row is always 'Duration'.
    let headerRow = [ 'Duration' ];

    // Append a label for each record based on its 'description' property.
    dataRecords.forEach(function ( singleRecord ) {
        headerRow.push(singleRecord.description);
    });

    return headerRow;
}