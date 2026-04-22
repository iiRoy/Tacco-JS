/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been modified.
 */


function   Main (  input   )
{

    // Step 1: Trim leading/trailing whitespace from the input string.
    input = input.trim( ) ;


    /*
     * Step 2: Create a shallow copy of the input string.
     * This operation on a string is redundant but kept for Type I clone definition.
     */
    input  =  input.slice( ) ;


    // Step 3: Split the input string into an array of lines based on newline characters.
    input = input.split ( "\n" ) ;


    /*
     * Step 4: For each line, split it into an array of strings based on spaces.
     * This results in a 2D array where each inner array represents a line's elements.
     */
    input = input.map( e => e.split( " " ) ) ;


    // Declare and initialize variable 'a'
    var a = input[ 0 ] . map ( e => parseInt( e ) ) ;


    // Declare and initialize variable 'b'
    var b = input[ 1 ] . map ( e => parseInt( e ) ) ;


    // Declare and initialize variable 'c'
    var c = input[ 2 ][ 0 ] . split ( "" ) ;


    /*
     * Calculate initial scores based on the characters in 'c'.
     * 'r' maps to b[2], 's' maps to b[0], and any other character (presumably 'p') maps to b[1].
     */
    var   startScores   =   c . map (  e =>
    {
        if ( e == "r" )
        {
            return b[ 2 ] ;
        }
        else if ( e == "s" )
        {
            return b[ 0 ] ;
        }
        else
        {
            return b[ 1 ] ;
        }
    } ) ;


    // Iterate through the startScores array to apply a specific game logic.
    // If a score at index 'i' is equal to a score at 'i + a[1]', set the latter to 0.
    startScores . forEach ( ( e , i , arr ) =>
    {
        if ( e == arr[ i + a[ 1 ] ] )
        {
            startScores[ i + a[ 1 ] ] = 0 ;
        }
    } ) ;


    // Calculate the total score by summing all elements in the startScores array.
    var score = startScores . reduce ( ( pre , cur ) => pre + cur , 0 ) ;


    // Output the final calculated score to the console.
    console.log ( score ) ;

}


// Main function call: Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;