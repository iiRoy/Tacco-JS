// This initial array will store each line read from the input stream.
var  inputStrings  =  [];

// Import the necessary module for line-by-line input processing.
var lineReaderModule = require('readline');

// Establish an interactive interface to handle standard input and output.
var inputProcessor = lineReaderModule.createInterface( {
    input:  process.stdin,
    output: process.stdout,
} );

// Attach an event listener to collect each incoming data line.
inputProcessor.on( 'line', function (receivedText) {
    inputStrings.push(receivedText);
} );


// Once the input stream indicates completion, execute the main processing logic.
inputProcessor.on('streamEnd', function () {
    // Extract the primary dimensions (N and M) from the very first input line.
    var firstDimension = Number( inputStrings[0].split(" ")[0] );
    var secondDimension = Number( inputStrings[0].split(" ")[1] );

    // Remove the processed header line from the collection.
    inputStrings.shift();

    // Convert the remaining raw input strings into structured numerical data (triplets).
    var relationList = inputStrings.map(
        (entryRow) => entryRow.split(" ").map(
            (tokenStr) => Number(tokenStr)
        )
    );

    // Initialize a status tracking array for 'firstDimension' elements, all set to an 'unmarked' state.
    var markerRegister = Array(firstDimension).fill(-1);
    // Initialize a counter for the final result.
    var finalCount = 0;

    // Sort the list of relations based on the value of their first component.
    relationList.sort( (elementA, elementB) => elementA[0] - elementB[0] );

    // Process each relation triplet until the list is empty.
    while (relationList.length > 0) {
        // Dequeue the next relation for processing.
        var processedRelation = relationList.shift();
        var nodeA = processedRelation[0];
        var nodeB = processedRelation[1];
        var edgeWeight = processedRelation[2]; // This variable's value is not utilized in the core logic.

        // Apply marking logic based on the current status of nodeA and nodeB.
        if (markerRegister[nodeA - 1] !== -1) {
            // If nodeA is already marked, then mark nodeB.
            markerRegister[nodeB - 1] = 1;
        }
        else if (markerRegister[nodeB - 1] !== -1) {
            // If nodeB is already marked, then mark nodeA.
            markerRegister[nodeA - 1] = 1;
        }
        else {
            // If neither nodeA nor nodeB is marked, increment the count and mark both.
            finalCount++;
            markerRegister[nodeA - 1] = 1;
            markerRegister[nodeB - 1] = 1;
        }
    }


    // Perform a final pass to count any elements that remain unmarked.
    for (var elementIndex = 0; elementIndex < firstDimension; elementIndex++) {
        if (markerRegister[elementIndex] === -1) {
            finalCount++; // Each unmarked element contributes to the total.
        }
    }

    // Display the calculated final result to standard output.
    console.log(finalCount);
});