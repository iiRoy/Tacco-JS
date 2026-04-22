const orderElements = ( firstItem , secondItem ) => {
    // This function is currently empty, designed for future comparison logic.
}

/**
 * Creates a frequency map (dictionary) from a given collection.
 * Each unique element in the collection becomes a key,
 * and its value is the count of its occurrences.
 * @param {Array<any>} sourceCollection - The array of items to count.
 * @returns {Object<string, number>} An object mapping items to their frequencies.
 */
function generateFrequencyMap ( sourceCollection ) {
    let occurrenceTracker = {}; // Initialize an empty object to store counts.
    for ( const elementValue of sourceCollection ) { // Iterate through each element in the input collection.
        // Count how many times the current element appears in the entire collection.
        occurrenceTracker[elementValue] = sourceCollection.filter( ( currentElement ) => {
            return currentElement === elementValue;
        }).length;
    }
    return occurrenceTracker; // Return the populated frequency map.
}

const processInputData = ( rawDataString ) => {
    // Split the raw input string into an array of lines.
    const processedLines = rawDataString.split ( '\n' );

    // The first line is often a count or metadata; remove it as it's not used here.
    const initialLineCount = processedLines.shift ( );

    // Generate a map of element frequencies from the remaining lines.
    const frequencyMap = generateFrequencyMap ( processedLines );

    // Get all unique keys (elements) from the frequency map.
    const uniqueElements = Object.keys( frequencyMap );

    // Prepare a list to hold detailed records of each element.
    const elementDetailsList = [ ];
    let highestFrequency = -Infinity ; // Initialize highest frequency found so far.

    // Iterate through each unique element to build detailed records and find the maximum frequency.
    uniqueElements.forEach( ( itemIdentifier ) => {

        const currentItemRecord = { }; // Create a temporary object for the current item's details.
        currentItemRecord.itemIdentifier = itemIdentifier ; // Store the item itself.
        currentItemRecord.itemCount = frequencyMap[ itemIdentifier ] ; // Store its frequency.
        elementDetailsList.push( currentItemRecord ) ; // Add the record to our list.

        // Update the highest frequency if the current item's count is greater.
        if ( frequencyMap[ itemIdentifier ] > highestFrequency ) {
            highestFrequency = frequencyMap[ itemIdentifier ] ;
        }
    } );

    // Filter the detailed records to find all items that have the highest frequency.
    const maxFrequencyItems = [ ];
    elementDetailsList.forEach( ( dataRecord ) => {
        if ( dataRecord.itemCount === highestFrequency ) {
            maxFrequencyItems.push( dataRecord.itemIdentifier ) ;
        }
    } ) ;

    // Sort the resulting items alphabetically.
    maxFrequencyItems.sort ( ) ;

    // Print each item with the highest frequency to the console.
    maxFrequencyItems.forEach( ( outputItem ) => { console.log( outputItem ) ; } ) ;
} ;


// Read input from standard input and pass it to the main processing function.
processInputData ( require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ) ;