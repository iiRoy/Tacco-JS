/*
 *   Module: Data Processor
 *   Purpose: To demonstrate a specific array manipulation technique.
 */
function processData(rawData)
{
    // Break down the incoming text by newlines.
    const lines = rawData.split('\n')
        ;

    // The first line contains the numerical sequence.
    let numbersString = lines[0]
        ;

    // The second line specifies the number of operations.
    let iterationsCount = Number.parseInt(lines[1], 10)
        ;

    // Convert the string of numbers into an array of integers.
    let currentValues = numbersString
        .split(' ')
        .map( itemString =>
            parseInt(itemString, 10)
        )
        ;

    // Perform the amplification process a specified number of times.
    for ( let loopCounter = 0; loopCounter < iterationsCount; loopCounter++ )
    {
        currentValues = amplifyLargestElement(currentValues);
    }

    /*
     *   The original implementation included a sum calculation,
     *   which has been commented out for this version.
     *   Example: currentValues.reduce( (accumulator, element) => accumulator + element, 0 );
     */
}


// This helper function identifies the largest element and doubles it.
function amplifyLargestElement ( sourceArray )
{
    // Create a mutable copy to avoid side effects on the original array.
    const modifiedCollection = [...sourceArray];

    // Determine the maximum value within the collection.
    const greatestValue = Math.max(...sourceArray); // Using spread operator for modern JS

    // Locate the first occurrence of the maximum value.
    const position = modifiedCollection.indexOf(greatestValue);

    // Modify the identified element by doubling its magnitude.
    modifiedCollection[position] = greatestValue * 2;

    // Return the altered collection.
    return modifiedCollection;
}


// Entry point: Read standard input and initiate processing.
processData( require('fs').readFileSync
    ('/dev/stdin'
        , 'utf8'
    )
);