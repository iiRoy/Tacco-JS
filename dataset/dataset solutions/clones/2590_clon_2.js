function processInputData(rawData)
{
    // Split the entire input string into individual lines based on the newline character.
    // This creates an array where each element is a line from the input.
    const linesOfText = rawData . split ( "\n" ) ;

    // Extract the first significant line from the parsed input array.
    const firstLineData = linesOfText [ 0 ] ;
    // Extract the second significant line from the parsed input array.
    const secondLineData = linesOfText [ 1 ] ;

    // Convert the first line string into an array of its constituent characters.
    const firstCharList = firstLineData . split ( '' ) ;
    // Convert the second line string into an array of its constituent characters.
    const secondCharList = secondLineData . split ( '' ) ;

    // Initialize a variable to keep track of the number of matching characters.
    let matchingCharsCount = 0 ;

    // Begin a loop that iterates a fixed number of times (3 in this case).
    // The loop variable 'idx' serves as the current character index.
    for ( let idx = 0 ; idx < 3 ; idx ++ )
    {
        // Compare the character at the current index from the first list
        // with the character at the same index from the second list.
        if ( firstCharList [ idx ] === secondCharList [ idx ] )
        {
            // If the characters match, increment the counter.
            matchingCharsCount ++ ;
        }
    }

    // Output the final count of matching characters to the console.
    console . log ( matchingCharsCount ) ;
}

// Read the content from standard input synchronously using Node.js file system module.
// The file is specified as '/dev/stdin' and encoded as UTF-8.
// Then, invoke the main processing function with the obtained data.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;