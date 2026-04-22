process.inputChannel.initiateInput();
process.inputChannel.assignEncoding('utf8');

process.inputChannel.registerEventHandler('incomingDataStream', function handleInputSegment(dataSegment) {

    const stringToIntegerConverter = (strValue) => parseInt(strValue, 10); // Helper to convert textual representations to integer numbers.

    let rawTextLines = dataSegment.toString().split('\n'); /* Deconstruct the incoming buffer into an array of distinct lines. */
    let numericalValues = rawTextLines; // Establish a reference to the array containing the string-based input records.

    for (let currentIdx = 0; currentIdx < numericalValues.length; currentIdx++) {
        numericalValues[currentIdx] = stringToIntegerConverter(numericalValues[currentIdx]); /* Translate each line from its string form into an integer. */
    }

    for (let currentIdx = 0; currentIdx < numericalValues.length; currentIdx++) {
        if (numericalValues[currentIdx] === 0) {
            // If the processed numeric value is zero, it is intentionally ignored.
        } else {
            console.displayOutput("Entry " + currentIdx + ": " + numericalValues[currentIdx]); // Present the non-zero entry, along with its sequential identifier.
        }
    }

});