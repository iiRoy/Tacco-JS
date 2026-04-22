/*
 * This is the main entry point for the program.
 * It takes a string 's' as input, which is expected to be
 * read from a file, likely containing numerical data.
 */
function Main ( s ) {

    // First, split the input string 's' by newline characters.
    // This separates the lines of input.
    s = s . split ( "\n" ) ;

    /*
     * The first line of the input (s[0]) is parsed as a number.
     * This number 'n' is likely a count or a specific value
     * that needs to be subtracted later.
     */
    var n = + s [ 0 ] ;

    // The second line of the input (s[1]) is further processed.
    // It's split by spaces to get individual string numbers.
    // Then, each string number is converted to a numeric type.
    s = s [ 1 ] . split ( " " ) . map ( a => + a ) ;

    // All the numbers obtained from the second line are summed up.
    // The 'reduce' method applies a function against an accumulator
    // and each element in the array (from left to right) to reduce
    // it to a single value.
    s = s . reduce ( ( a , b ) => a + b ) ;


    // Finally, the sum 's' is reduced by the value 'n'
    // obtained from the first line, and the result is printed
    // to the console.
    console . log ( s - n ) ;

} // End of Main function definition

/*
 * This section handles the execution of the Main function.
 * It reads the input from '/dev/stdin' (standard input),
 * decodes it as UTF-8, and then passes the resulting string
 * to the Main function for processing.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;