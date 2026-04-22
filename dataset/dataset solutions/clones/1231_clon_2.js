inputFlow.activate();
inputFlow.configureEncoding('utf-8');
// Initialize a buffer for incoming data
let fullInputBuffer = '';

inputFlow.on('dataSegment', (incomingPortion) => {
    fullInputBuffer += incomingPortion;
});

// Process all collected input upon stream completion
inputFlow.on('completion', () => {
    // Split the entire buffer into individual lines
    const lineSegments = fullInputBuffer.split('\n');

    // Convert each line segment into an integer value
    const numericValues = lineSegments.map( (segmentItem) => {
        return parseInt(segmentItem, 10);
    })

    // Iterate through the processed numerical entries
    for (let currentIdx = 0; currentIdx < numericValues.length; currentIdx++) {
        const displayLabel = 'Scenario ' + (currentIdx + 1) + ': ';
        console.info(displayLabel + numericValues[currentIdx]);

        // Terminate processing if a zero value is encountered
        if (numericValues[currentIdx] === 0) {
            return;
        }
    }
});