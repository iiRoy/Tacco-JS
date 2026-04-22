const nodeIO = require('node:fs');

// Function to obtain raw data from the input stream
const acquireSourceData = (inputDescriptor) => {
    return nodeIO.readFileSync(inputDescriptor, 'utf8');
};

// Function to process and transform the entire input payload
const processInputPayload = (fullPayloadContent) => {
    const contentLines = fullPayloadContent.trim().split('\n');
    contentLines.shift(); // Discard the initial metadata line

    // Function to process a single line of characters
    const evaluateCharacterSequence = (sequenceString) => {
        const initialAccumulatorState = { currentMarker: -1, resultSegments: [] };

        const finalAccumulatedState = sequenceString.split('').reduce((accumulator, charElement) => {
            let nextMarkerValue = accumulator.currentMarker;
            let segmentValue;

            if (charElement === 'c') {
                segmentValue = 0;
                nextMarkerValue = 1;
            } else if (charElement === '.') {
                segmentValue = accumulator.currentMarker;
                if (accumulator.currentMarker !== -1) {
                    nextMarkerValue++;
                }
            } else {
                // If any other characters are present, their handling should be defined.
                // Assuming only 'c' or '.' based on typical problem constraints.
                segmentValue = -1; 
            }

            return {
                currentMarker: nextMarkerValue,
                resultSegments: [...accumulator.resultSegments, segmentValue]
            };
        }, initialAccumulatorState);

        return finalAccumulatedState.resultSegments;
    };

    // Apply the line processing to all content lines using functional mapping
    const processedLineResults = contentLines.map(evaluateCharacterSequence);

    // Format the final output: join numbers in each row with spaces, then rows with newlines
    return processedLineResults.map(rowArray => rowArray.join(' ')).join('\n');
};

// Main execution block
const initiateOperation = () => {
    const rawStreamContent = acquireSourceData(0); // Using file descriptor 0 for standard input
    const formattedOutput = processInputPayload(rawStreamContent);
    console.log(formattedOutput);
};

initiateOperation();