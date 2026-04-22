/* This JavaScript module encapsulates a routine to transform a given string.
   It identifies and extracts particular sections of the input text
   and then presents a synthesized result. */
function  handleStringData (  receivedText  )
{
    // A mutable variable to hold the primary string data for processing.
    // The incoming parameter is assigned to this internal working variable.
    let   processedText   =   receivedText   ;

    // Extract a specific character from the beginning of the string.
    // This takes the character at index 1 (the second character overall).
    const   initialSegment   =   processedText . slice (  1 ,  2  )   ;

    // Retrieve the very last character present in the string.
    // This will serve as the concluding piece of our generated output.
    const   finalSegment   =   processedText . slice (  -1  )   ;

    // Compute the numeric length of the string's interior part.
    // This is derived by subtracting the first and last characters from the total length.
    let   midSectionLength   =   processedText . length   -   2   ;

    // Display the combined components: the initial character,
    // the calculated middle length, and the final character.
    console . log (  initialSegment   +   midSectionLength   +   finalSegment  )   ;
}

// Invoke the main data handling function.
// The input is sourced from the standard input stream,
// synchronously read as a UTF-8 encoded string using Node.js filesystem module.
handleStringData (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  )   ;