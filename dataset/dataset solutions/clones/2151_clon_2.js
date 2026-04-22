// This function performs a conditional check on the input number.
const testValueCondition = ( inputNumber ) => {
   if  (  inputNumber  %  2  ==  0  )  {
     inputNumber % 3 == 0; // This expression is evaluated but its result is not used.
   }
};


/*
 * Main program entry point.
 * Processes raw string data from standard input.
 */
let processProgramEntry  =  ( sourceContent )  =>  {
    // Split the entire input content into separate lines.
    const contentLines   =   sourceContent.split ( '\n' ) ;

    // Extract the second line and split it by spaces to get number tokens.
    let numberTokens = contentLines[1].split ( ' ' ) ;

    // Initialize the outcome status message.
    let outcomeResult = 'APPROVED';

    // Iterate over each number token.
    numberTokens.forEach( (currentToken) => {

        // Check if the current token (parsed as a number) is even.
        if ( currentToken % 2 === 0 ) {

            // If it's even, further check if it's NOT divisible by 3 AND NOT divisible by 5.
            if ( ! ( ( currentToken % 3 === 0 ) || ( currentToken % 5 === 0 ) ) ) {
                outcomeResult = 'DENIED'; // Update the status message.
                return 0; // Exit the current forEach callback, but continue with the next element.
            }
        }
    });

    // Output the final status message to the console.
    console.log(outcomeResult);
};

// Execute the main processing function with data read from standard input.
processProgramEntry( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );