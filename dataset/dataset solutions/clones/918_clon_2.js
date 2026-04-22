let rawInputData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Parse the incoming string data into four distinct numerical components.
// The input is expected to contain space-separated values.
let [
    firstNumber ,   // The initial numeric quantity.
    secondNumber ,  // The subsequent numeric quantity.
    thirdNumber ,   // The third numeric quantity encountered.
    fourthNumber    // The final numeric quantity in the sequence.
] =
    rawInputData
        . trim ( )       // Remove any leading or trailing blank spaces.
        . split ( " " )  // Divide the cleaned string into an array of substrings using space as a delimiter.
        . map ( Number ) ; // Transform each substring in the array into its numerical equivalent.


// Evaluate a specific parity condition involving products and sums of the parsed numbers.
// The condition checks if the product of the first two numbers is odd AND if the sum of the last two numbers is odd.
if (
       ( ( firstNumber * secondNumber ) % 2 !== 0 ) // Is the product of the first and second numbers an odd value?
    && ( ( thirdNumber + fourthNumber ) % 2 !== 0 )  // Is the sum of the third and fourth numbers an odd value?
)
{
    // If both conditions (product is odd AND sum is odd) are met, then output "No".
    console.log ( "No" ) ;
}
else
{
    // Otherwise, if either the product is even OR the sum is even (or both), then output "Yes".
    console.log ( "Yes" ) ;
}

// Program execution concludes.