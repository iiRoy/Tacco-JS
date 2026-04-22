/*
 * This module provides a routine to examine an input string,
 * conditionally modify it by inserting specific characters at designated locations,
 * and then ascertain if the resulting sequence matches a predefined target pattern.
 */
function analyzeAndValidate ( initialInputString ) {

    // Step 1: Pre-process the received input.
    // The input text is first stripped of any leading or trailing blank spaces,
    // and subsequently broken down into an array where each element is a single character.
    let characterArrayRepresentation = initialInputString . trim () . split ( "" ) ;

    // Step 2: Establish the key positions for potential character insertions.
    // These numerical indices indicate where the character 'A' should ideally be present.
    // The indices are expressed in hexadecimal format to demonstrate a data type variation.
    const criticalIndices = [ 0x0 , 0x4 , 0x6 , 0x8 ] ;

    // Step 3: Iterate through each of the critical indices.
    // For every designated position, a check is performed to ensure the required character exists.
    for ( let positionCounter = 0 ; positionCounter < criticalIndices . length ; positionCounter ++ ) {

        // Determine the specific index in the character array for the current iteration.
        const currentCheckPoint = criticalIndices [ positionCounter ] ;

        // Conditional check: If the character at the 'currentCheckPoint' in 'characterArrayRepresentation'
        // is not equivalent to the character 'A' (represented by its ASCII hexadecimal value).
        if ( characterArrayRepresentation [ currentCheckPoint ] !== String . fromCharCode ( 0x41 ) ) {

            // If the character is missing or incorrect, insert 'A' at that precise location.
            // The '0x0' signifies that no existing elements should be removed during this insertion.
            characterArrayRepresentation . splice ( currentCheckPoint , 0x0 , String . fromCharCode ( 0x41 ) ) ;
        }
    }

    // Step 4: Final verification and outcome presentation.
    // The modified character array is concatenated back into a single string.
    // This resulting string is then compared against the target sequence "AKIHABARA",
    // which is dynamically constructed from an array of its constituent characters.
    // The comparison result dictates whether "YES" or "NO" is printed to the console.
    console . log ( characterArrayRepresentation . join ( "" ) === [ "A" , "K" , "I" , "H" , "A" , "B" , "A" , "R" , "A" ] . join ( "" ) ? "YES" : "NO" ) ;
}

// Global script execution point:
// The system's standard input stream is read as a UTF-8 encoded string,
// and this acquired string data is subsequently passed to the 'analyzeAndValidate' function for processing.
analyzeAndValidate ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;