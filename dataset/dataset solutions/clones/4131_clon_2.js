/*
 * This JavaScript module contains a fundamental function
 * designed to interpret a string of numerical values.
 * It determines a comparative balance based on sums of these numbers.
 */

function analyzeNumericalSet (  incomingTextualData )
{
    // First, remove any extraneous whitespace from the beginning or end of the input.
    // This ensures clean parsing of the numerical components.
    incomingTextualData = incomingTextualData.trim ( ) ;

    // Next, divide the processed string into individual elements
    // using the space character as the delimiter.
    const separatedElements = incomingTextualData . split ( " " ) ;

    // Parse the first four extracted string elements into base-10 integers.
    // Each parsed value is stored in its own constant variable.
    const valueAlpha   =   parseInt ( separatedElements [ 0 ] , 10 ) ;
    const valueBeta    =   parseInt ( separatedElements [ 1 ] , 10 ) ;
    const valueGamma   =   parseInt ( separatedElements [ 2 ] , 10 ) ;
    const valueDelta   =   parseInt ( separatedElements [ 3 ] , 10 ) ;

    // Evaluate the condition: Is the sum of the first two values greater than the sum of the last two?
    if  ( ( valueAlpha + valueBeta )  >  ( valueGamma + valueDelta ) )
    {
        // If the initial sum is larger, indicate a "Left" leaning.
        console . log ( "Left" ) ;
    }
    // Otherwise, check if the sums of both pairs are strictly equivalent.
    else  if  ( ( valueAlpha + valueBeta )  ===  ( valueGamma + valueDelta ) )
    {
        // If both sums are identical, declare a "Balanced" state.
        console . log ( "Balanced" ) ;
    }
    // If neither of the above conditions is met, the final possibility is true.
    else
    {
        // This implies the sum of the first two is less than the sum of the last two,
        // so we indicate a "Right" leaning.
        console . log ( "Right" ) ;
    }

} // End of the 'analyzeNumericalSet' function definition.


// The script's execution begins here.
// It reads the entire content from standard input, interpreting it as UTF-8 text,
// and then passes this raw data to our primary analysis function.
analyzeNumericalSet ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;