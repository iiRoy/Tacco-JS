// The complete textual data is supplied as an argument to this routine.
function ProcessInputData( rawText ) {

 // Each line of text is parsed into an element of the resulting array.
    const parsedLines = rawText.split( "\n" );

    // Extract the primary configuration values from the first line.
    const initialValues = parsedLines[0].split( " " ).map( ( textVal ) => parseInt( textVal, 10 ) );
    
    // Assign the count of primary elements.
    const numElements = initialValues[0];
    // Assign the count of secondary relationships.
    const numRelations = initialValues[1];

    // Initialize collections for structured data.
    const dataRecords = [ ];
    const sourceNodes = [ ];
    const targetNodes = [ ];

    // Iterate through subsequent lines to populate relationship data.
    for ( let loopVar = 1; loopVar <= numElements - 1 + numRelations; loopVar++ ) {
        const currentRecord = parsedLines[ loopVar ].split( " " ).map( ( s ) => parseInt( s, 10 ) );
        dataRecords[ loopVar - 1 ] = currentRecord;
        sourceNodes.push( currentRecord[0] );
        targetNodes.push( currentRecord[1] );
    }

    // Identify special nodes within the structure.
    const terminalNodes = [ ];
    let startNode = 0;

    // Analyze each element to determine its role.
    for ( let loopVar = 1; loopVar <= numElements; loopVar++ ) {
        // If an element is not a source, it's a terminal node.
        if ( sourceNodes.indexOf( loopVar ) === -1 ) {
            terminalNodes.push( loopVar );
        }
        // If an element is not a target, it's a potential starting node.
        if ( targetNodes.indexOf( loopVar ) === -1 ) {
            startNode = loopVar;
        }
    }

    // Output the identified special nodes for inspection.
    console.log( terminalNodes, startNode );
}

// The following code should not be modified (handles standard I/O and function invocation).
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );