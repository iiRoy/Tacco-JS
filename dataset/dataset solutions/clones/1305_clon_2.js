// This JavaScript module processes text from standard input,
// performing a case reversal operation on alphabetic characters.

var sourceContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The above line acquires all text data from the specified input stream.

var finalProcessedString = ''; // An empty mutable string buffer to hold the transformed output.


// Begin iteration through each character of the acquired source text.
for
(
    var charIndex = 0 ; // Initialize character position counter.
    charIndex < sourceContent . length ; // Loop continues as long as there are characters to process.
    charIndex ++ // Increment the character position for the next iteration.
)
{
    // Determine if the current character's ASCII value falls within the uppercase alphabet range (A-Z).
    if
    (
           ( sourceContent . charCodeAt ( charIndex ) >= 65 ) // Check if character is 'A' or later.
        && ( sourceContent . charCodeAt ( charIndex ) <= 90 )  // Check if character is 'Z' or earlier.
    )
    {
        // If the character is an uppercase letter, convert it to its lowercase equivalent
        // and append it to the accumulating result string.
        finalProcessedString = finalProcessedString + sourceContent . charAt ( charIndex ) . toLowerCase ( ) ;
    }
    else
    {
        // Otherwise (if it's a lowercase letter, a number, a symbol, etc.),
        // convert it to its uppercase equivalent and append to the result string.
        finalProcessedString = finalProcessedString + sourceContent . charAt ( charIndex ) . toUpperCase ( ) ;
    }
}


// Output the fully processed string to the console.
// The .trim() method ensures no extraneous leading or trailing whitespace is included in the final display.
console . log ( finalProcessedString . trim ( ) ) ;