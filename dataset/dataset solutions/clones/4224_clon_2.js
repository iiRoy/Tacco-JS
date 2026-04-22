// Function to process the initial input string and attempt to find a specific arithmetic combination
function CalculateExpression( sourceString )
{
    // Break down the incoming string into an array of individual character digits.
    const charDigits = sourceString . split ( "" );

    // This array will hold the determined operators ('+' or '-') for the expression.
    let operatorSymbols = [];

    // Recursive auxiliary function to explore different operator placements
    // currentIndex: Represents the position from the rightmost digit being considered (decrements to 0).
    // runningTotal: The accumulated sum from the rightmost digits processed so far.
    function EvaluatePaths( currentIndex , runningTotal )
    {
        // Base condition: When all digits have been processed (currentIndex reaches zero).
        if ( currentIndex === 0 )
        {
            // Check if the final accumulated total matches the target (zero in this specific sub-problem).
            if ( runningTotal === 0 )
            {
                // If the target is met, this path is successful.
                return true ;
            }
        }
        else
        {
            // Recursive step: Convert the current character digit to an integer.
            const digitValue = parseInt( charDigits[ currentIndex - 1 ], 10 );

            // First attempt: Try adding the current digit's value to the running total.
            if ( EvaluatePaths( currentIndex - 1 , runningTotal + digitValue ) === true )
            {
                // If adding leads to a solution, record a '-' operator for this position
                // (because adding in the recursive step means it's treated as subtraction from the target).
                operatorSymbols[ currentIndex - 1 ] = "-";
                return true ;
            }
            // Second attempt: If adding didn't work, try subtracting the current digit's value.
            else if ( EvaluatePaths( currentIndex - 1 , runningTotal - digitValue ) === true )
            {
                // If subtracting leads to a solution, record a '+' operator for this position
                // (because subtracting in the recursive step means it's treated as addition to the target).
                operatorSymbols[ currentIndex - 1 ] = "+";
                return true ;
            }
            // If neither adding nor subtracting yields a solution, this particular path is unsuccessful.
            else
            {
                return false ;
            }
        }
    }

    // Initiate the recursive search with the specific problem parameters:
    // Starting with 4 digits and aiming for an overall target sum of 7.
    if ( EvaluatePaths( 4 , 7 ) === true )
    {
        // If a valid combination of operators is found, print the constructed expression.
        // The output format assumes specific indices for digits and operators.
        console . log (
            charDigits[ 0 ] +
            operatorSymbols[ 1 ] +
            charDigits[ 1 ] +
            operatorSymbols[ 2 ] +
            charDigits[ 2 ] +
            operatorSymbols[ 3 ] +
            charDigits[ 3 ] +
            "=7"
        );
    }
    else
    {
        // If no solution is discovered after exploring all possible paths.
        console . log ( "calculation failure" );
    }
}

// Entry point: Read input from the standard input stream and pass it to the main processing function.
CalculateExpression( require('fs').readFileSync('/dev/stdin', 'utf8') );