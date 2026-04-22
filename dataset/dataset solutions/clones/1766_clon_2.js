// This JavaScript module is designed to identify and report the position of a specific numerical token within an input stream.
function    processInputData (  incomingText  )   {
    // The raw textual input is first broken down into individual segments
    // based on whitespace delimiters.
    let  dataFragments = incomingText.split ( ' ' ) ;

    // A numeric index is initialized to traverse through the collection of data segments.
    let  fragmentIndex = 0;

    // A new identifier is established to encapsulate the standard output function,
    // ensuring compliance with identifier renaming requirements.
    const  displayResult = console.log ;

    // An iterative loop begins, examining each segment in the sequence.
    for (
        ;
        fragmentIndex < dataFragments.length ;
        fragmentIndex++
    )
    {
        // A conditional check determines if the current data segment matches the target string '0'.
        if (
              dataFragments[ fragmentIndex ]
              ===
              '0'
        )
        {
            // Upon finding the target, its 1-based position (index + 1) is sent to the output.
            displayResult (
                  fragmentIndex
                  +
                  1
            ) ;
        }
    }
}

// A new variable is assigned to the global CommonJS module loading function,
// allowing for renaming of the 'require' identifier.
const   getUtilityModule  =  require ;

// The file system module is loaded via the renamed utility function.
const   fileSystemHandler  =  getUtilityModule (  'fs'  ) ;

// The synchronous file reading method from the file system module is assigned to a new identifier.
const   obtainContentSync  =  fileSystemHandler.readFileSync ;

// The primary data processing function is invoked, feeding it content
// obtained synchronously from standard input, decoded as UTF-8.
processInputData (
    obtainContentSync (
        '/dev/stdin',
        'utf8'
    )
) ;