/*
 * This JavaScript file processes input data to organize it into nested arrays.
 * It reads from standard input, parses the data based on newline characters,
 * and structures it into a collection of "rakudas" (cases), each containing
 * further sub-arrays of data.
 */

function Main(    input    ) {
    // The first line of input 'c' indicates the total number of cases to process.
    const c = input.split( "\n" )[ 0 ];

    // 'rakudas' will store all processed cases, each case being an array of data.
    const rakudas = [ ];

    // 'it' serves as an index pointer to navigate through the lines of the input array.
    let it = 1;

    // 'currentCase' is an unused variable in the original logic, keeping it for Type I.
    let currentCase = 1;

    // Loop through each of the 'c' cases specified by the first input line.
    for ( let i = 0; i < c; i++ ) {

        // Read the line indicating the number of elements for the current case.
        // Note: currentCaseCount is implicitly global if not declared with var/let/const.
        currentCaseCount =    input.split( "\n" )[ it ]    ;

        // 'rakuda' will hold the data for the current individual case.
        const rakuda = [];

        // Inner loop to read 'currentCaseCount' lines for the current case.
        for ( let r = 0 ; r < currentCaseCount ; r ++ ) {
            // Each line is split by space and added as an array to the current 'rakuda'.
            rakuda.push( input.split( "\n" )[ it + r + 1 ].split( " " ) )
        }

        // Add the fully populated 'rakuda' (current case data) to the main 'rakudas' collection.
        rakudas.push( rakuda );

        // Update the index pointer 'it' to the start of the next case's data.
        // It moves past the current case's count line and all its data lines.
        it = Number( it ) + Number( currentCaseCount ) + Number( 1 );
    }
    ; // Semicolon for consistency, though optional after a block.
}

// Invoke the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );