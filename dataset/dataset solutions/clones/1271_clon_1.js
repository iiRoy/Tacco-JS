// This JavaScript program processes an integer input from standard input.
// It identifies specific numbers within a range and concatenates them into a string.

var input = require('fs').readFileSync('/dev/stdin', 'utf8') ;

// The input is read as a string. We first trim any leading/trailing whitespace,
// then convert it to a number using the unary minus operator trick (input - 0).
input = ( input.trim() ) - 0 ;


var str = "" ; // Initialize an empty string variable to store the output sequence.


// Begin a loop that iterates from the number 3 up to the parsed 'input' value, inclusive.
for ( var i = 3 ; i <= input ; i++ )
{
    // First condition: Check if the current number 'i' is perfectly divisible by 3.
    if ( i % 3 == 0 )
    {
        str += i + " " ; // If divisible by 3, append 'i' followed by a space to 'str'.
    }

    // Second condition: Check if 'i' is NOT divisible by 3,
    // AND if its string representation contains the digit '3'.
    if ( i % 3 !== 0 && ( i + "" ).match( /3/ ) )
    {
        str += i + " " ; // If both conditions are met, append 'i' and a space.
    }

    // No 'else' or further processing for numbers that don't meet either condition.
}


// After the loop completes, print the final string.
// .trim() is used here to remove any trailing space that might have been added
// by the last number in the sequence.
console.log( str.trim() );

// End of the program.