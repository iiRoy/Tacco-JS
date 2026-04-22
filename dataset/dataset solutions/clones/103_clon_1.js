// This is a JavaScript program designed to process input
// from standard input, likely for a coding challenge.
// It implements a logic similar to the "Hit and Blow" game.


var input = require('fs') . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// The 'fs' module is used here to read the entire content
// of the standard input stream ('/dev/stdin') as a UTF-8 string.


var Arr = ( input . trim() ) . split ( "\n" ) ;
// The raw input string is first trimmed to remove any leading or
// trailing whitespace, then split into an array of strings based on
// newline characters. Each element in 'Arr' represents a line of input.


// The main processing loop iterates through the 'Arr' array.
// It processes two lines at a time, incrementing 'i' by 2 in each step.
for ( var i = 0 ; i < Arr . length ; i = i + 2 )
{
    // For the current pair of lines:
    // The first line (Arr[i]) is split by spaces and
    // each resulting string is converted to a Number.
    var a = Arr[i] . split ( " " ) . map ( Number ) ;


    // Similarly, the second line (Arr[i+1]) is processed
    // into an array of numbers.
    var b = Arr[i+1] . split ( " " ) . map ( Number ) ;


    // Initialize counters for 'hit' and 'blow'.
    // 'hit' counts numbers that are correct in both value and position.
    var hit = 0 ;
    // 'blow' counts numbers that are correct in value but wrong in position.
    var blow = 0 ;


    // Inner loop to compare the elements of array 'a' with 'b'.
    // This loop runs exactly 4 times, implying the numbers sequences
    // are always of length 4.
    for ( var j = 0 ; j < 4 ; j ++ )
    {
        // Check if the number at position 'j' in 'a' is strictly equal
        // to the number at position 'j' in 'b'.
        if ( a[j] === b[j] )
        {
            hit ++ ; // If they are strictly equal, it's a 'hit'.
        }
        // If it's not a 'hit', check if the number from 'b' at position 'j'
        // exists anywhere within the array 'a'.
        else if ( a . indexOf ( b[j] ) != -1 )
        {
            blow ++ ; // If it exists elsewhere, it's a 'blow'.
        }
    }


    // After processing the current pair of lines (arrays 'a' and 'b'),
    // the final 'hit' and 'blow' counts are printed to the console,
    // separated by a space.
    console . log ( hit + " " + blow ) ;
}

// End of the program execution.
// The script will continue to process input pairs until 'Arr.length' is exhausted.