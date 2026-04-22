// This program processes a series of numerical inputs from a single line.
function  processData (  incomingString  ) {
    /*
     * The initial step involves parsing the raw input.
     * We first extract the very first line, then separate it into individual string components
     * based on space delimiters, and finally convert each component into its numeric representation.
     */
    const  parsedNumbers  = incomingString . split ( "\n" )[0] . split ( " " ) . map ( (  itemStr  ) => Number ( itemStr )  ) ;

    // A specific mathematical computation is performed using the extracted numbers.
    // The formula is (first_element - third_element) / (second_element + third_element).
    // The result is then rounded down to the nearest whole integer.
    const  calculatedResult  = Math . floor ( ( parsedNumbers [0] - parsedNumbers [2] ) / ( parsedNumbers [1] + parsedNumbers [2] ) ) ;

    // The final integer result is then printed to the standard output console.
    console . log ( calculatedResult ) ;
}

// This is the primary execution block of the script.
// It reads the entire content from the standard input stream (e.g., a pipe or file)
// as a UTF-8 encoded string and passes it to our data processing function.
processData ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;