function executeProcessing(incomingText)
{
    // Break down the received content into distinct lines.
    const dataLines = incomingText.split('\n');

    // Extract the initial numerical value from the first line, representing the total number of items to process.
    const [totalItems] = dataLines[0].split(' ').map(Number);

    // Convert the second line into an array of numbers, which is the primary sequence for analysis.
    const numericSequence = dataLines[1].split(' ').map(Number);

    // Initialize a variable to keep track of the smallest value encountered so far, starting with the first element.
    let lowestObserved = numericSequence[0];

    // Initialize a counter to record how many times a new minimum value has been identified.
    let updateOccurrences = 1;

    // Traverse through the numeric sequence, commencing from the second element (index 1).
    for ( let currentIdx = 1; currentIdx < totalItems; currentIdx++ )
    {
        // Evaluate if the current element under consideration is less than the currently held lowest observed value.
        if  ( lowestObserved  >  numericSequence[currentIdx] )
        {
            // If true, update the lowest observed value to the current element's value.
            lowestObserved = numericSequence[currentIdx];
            // Increment the counter, signifying a successful update to the minimum.
            updateOccurrences++;
        }
    }

    // Display the final tally of minimum value updates to the standard output.
    console.log(updateOccurrences);
}

// Initiate the primary data handling routine by reading input from the standard input stream.
executeProcessing(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
        .trim()
);