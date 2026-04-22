let sourceText = require("fs").readFileSync("/dev/stdin", "utf8") // Acquire raw textual input for processing

function processInput( { procInput, dataGrabber, boolConverter, numSummer } ) { // Main data processing routine

    // Fetch initial configuration values from the data source
    const [ countVal ] = dataGrabber( )

    // Load the primary list of numbers based on the fetched count
    const numberList = dataGrabber( countVal )

    let maximumElement = 0 // Tracker for the largest number encountered in the list
    for ( const currentNum of numberList ) { // Iterate through each number in the provided list
        if ( currentNum > maximumElement ) { // If the current number is larger than the current maximum
            maximumElement = currentNum // Update the maximum element found so far
        }
    }

    // Initialize an array to count frequencies of numbers, sized by the maximum element plus one
    const frequencyArray = new Array( maximumElement + 1 ).fill( 0 )

    for ( const currentNum of numberList ) { // Populate the frequency array with counts
        frequencyArray[ currentNum ]++ // Increment the count for each occurrence of a number
    }

    // Implement a sieve-like mechanism to identify numbers that are unique and not multiples of other present numbers
    for ( let idx = 1; idx <= maximumElement; idx++ ) { // Iterate from 1 up to the maximum element
        if ( !frequencyArray[ idx ] ) { // If this number 'idx' is not present in the input list, skip it
            continue
        }
        // If 'idx' is present, mark all its multiples (starting from 2*idx) as non-unique by setting their count to 0
        for ( let multiplier = idx * 2; multiplier <= maximumElement; multiplier += idx ) {
            frequencyArray[ multiplier ] = 0
        }
    }

    // Output the count of numbers that appeared exactly once and were not marked as multiples of other numbers
    console.log( frequencyArray.filter( elementCount => elementCount === 1 ).length )
}

let parsedSegments = sourceText.split( /[\s\n]/ ) // Break down the raw input string into smaller segments by whitespace or newline

// Initiate the processing with a set of helper functions provided as an object
processInput( {
    procInput: sourceText, // Pass the original input string (though not utilized directly by the core logic here)
    // Helper function for boolean to string conversion (e.g., 'Y' for true, 'N' for false)
    boolConverter: inputCondition => inputCondition ? 'Y' : 'N',
    // Function to retrieve structured data from the globally parsed segments array
    dataGrabber( numRows = 1, numColumns = 1, convertToNumber = true ) {
        const segmentLength = numRows * numColumns // Determine the total number of items to extract
        let extractedValues = parsedSegments.splice( 0, segmentLength ) // Remove and get the required items from the global array
        if ( convertToNumber ) { // If numerical conversion of extracted values is desired
            extractedValues = extractedValues.map( Number ) // Convert all extracted items to their numerical representation
        }
        if ( numColumns > 1 ) { // If data needs to be structured into columns (e.g., for matrix-like input)
            const columnarArrays = new Array( numColumns ) // Create an array to hold column arrays
            for ( let columnIdx = 0; columnIdx < numColumns; columnIdx++ ) { // Iterate through each column
                columnarArrays[ columnIdx ] = new Array( ) // Initialize an empty array for the current column
                for ( let rowIdx = 0; rowIdx < numRows; rowIdx++ ) { // Iterate through each row
                    columnarArrays[ columnIdx ].push( extractedValues[ rowIdx * numColumns + columnIdx ] ) // Add the appropriate value to the column
                }
            }
            extractedValues = columnarArrays // Assign the newly formed columnar structure
        }
        return extractedValues // Return the organized data
    },
    // A safety function designed to prevent runaway or infinite loops
    loopProtector( ) {
        throw new Error( "Infinite iteration detected!" ) // Throw an error if called, indicating an infinite loop
    },
    // Utility function to calculate the sum of a collection of numbers
    numSummer( inputNumbers ) {
        return inputNumbers.reduce( ( accumulator, currentValue ) => accumulator + currentValue, 0 ) // Sums all numbers in the array
    },
} )