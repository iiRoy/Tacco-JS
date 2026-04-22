/*
 * This script demonstrates reading input from standard input
 * and processing it line by line.
 * It's a Type I clone example, focusing on whitespace and comments.
 */

// Declare the 'hoge' variable to store the raw content read from the file system.
// The 'fs' module is used for file system operations.
var   hoge   =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;


// The 'num' variable will hold an array of strings,
// where each string is a line from the input.
var   num    =    hoge . split ( '\n' ) ;

// Start a loop to iterate through each element of the 'num' array.
// 'i' is the loop counter, 'iz' stores the total number of elements.
for ( var    i    =    0 ,    iz    =    num . length ;    i    <    iz ;    i ++    )
{
    // For each iteration, log a message to the console.
    // The message includes the current case number and the content of the line.
    console . log ( 'Case '    +    i    +    ': '    +    num [ i ] ) ; // Outputting the result
}

/*
 * End of the JavaScript program.
 * All lines have been processed and outputted.
 */