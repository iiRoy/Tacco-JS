function ProcessInput (rawData) {
    // Split the entire input string into an array of individual text rows
    let textRows = rawData.split('\n');

    // Iterate through each received line of data
    for (const currentRowData of textRows) {
        // Check if the current line signals termination
        if ( currentRowData === '0 0' ) {
            // If so, stop processing further lines
            break;
        }

        // Parse the numerical dimensions from the current line
        const parsedDimensions = currentRowData.split(' ').map(Number);
        let heightVal = parsedDimensions[0]; // Assign the first parsed number as height
        let widthVal = parsedDimensions[1];   // Assign the second parsed number as width

        // Construct and display the visual pattern based on the dimensions
        console.log(
               Array(widthVal + 1) .join('#') + '\n'                                 // The top border row
            +  Array(heightVal - 1) .join(                                        // The middle section (height-2 rows)
                  '#' + Array(widthVal - 1) .join('.') + '#\n'
               )
            +  Array(widthVal + 1) .join('#') + '\n'                                 // The bottom border row
        );
    }
}

// Read the input content from standard input and initiate the processing
ProcessInput( require('fs').readFileSync('/dev/stdin', 'utf8') );