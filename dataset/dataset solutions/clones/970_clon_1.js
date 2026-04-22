var    input    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ; // Read the entire input from standard input
// This line initializes the 'input' variable with the content of /dev/stdin.

var    arr    =    input . trim ( ) . split ( "\n" ) ; /* Split the input into an array of lines */

// The 'arr' variable now holds an array where each element is a line from the input.

var    a    =    arr [ 0 ] ; // Assigns the first line of input to variable 'a'
var    b    =    arr [ 1 ] ; /* Assigns the second line of input to variable 'b' */

var    len    =    b . length    -    1 ; // Calculate the length of 'b' minus one. This is crucial for later index adjustments.

var    reg    =    new    RegExp ( b ,    "g" ) ; // Create a new regular expression with 'b' as the pattern and 'g' (global) flag.

var    ans    =    [ ] ; // Initialize an empty array to store the results (indices of matches).

// Start of the main loop to find all occurrences of 'b' in 'a'.
while    (    reg . test ( a )    )
{
   // If a match is found by reg.test(a), its lastIndex property is updated.
   reg . lastIndex    -=    len ; // Adjust the lastIndex to account for overlapping matches.
   ans . push ( reg . lastIndex    -    1 ) ; // Add the 0-based starting index of the match to the 'ans' array.
}
// End of the while loop.

// Check if any matches were found before attempting to print.
if    (    ans . length    !=    0    )
{
   console . log ( ans . join ( "\n" ) ) ; // Print each found index on a new line.
}
// This marks the end of the script's execution.