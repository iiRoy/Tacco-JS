/*
 * This JavaScript file contains utility functions and processes card game data.
 * It demonstrates reading standard input and manipulating arrays/objects.
 */

// Function to read all input from standard input and process it into lines.
function  stdin  (  )   {
    // Uses Node.js 'fs' module to synchronously read the entire input stream.
    var  stdin  =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;
    // The input string is then split into an array of lines,
    // handling both Unix (\n) and Windows (\r\n) line endings.
    return  stdin . split ( / \n \r ? / ) ;
}


// This helper function generates an array of numbers within a specified range.
function  range (  from ,  to  ) {
    // Initializes an empty array to store the sequence of numbers.
    var  ret  =  [ ] ;
    // Loops from the 'from' value up to and including the 'to' value.
    for  ( var  i  =  from ;  i  <=  to ;  i ++  )  {
        ret . push ( i ) ;  // Adds the current number to the array.
    }
    return  ret ;  // Returns the populated array.
}


// Declaration of a global object named 'full'.
// This object initially holds arrays representing full suits of cards (1 to 13).
var  full  =  {
    S :  range ( 1 ,  13 ) ,  /* Spades: an array containing numbers 1 through 13. */
    H :  range ( 1 ,  13 ) ,  // Hearts: another array for numbers 1 through 13.
    C :  range ( 1 ,  13 ) ,  /* Clubs: array for numbers 1 through 13. */
    D :  range ( 1 ,  13 )   // Diamonds: array for numbers 1 through 13.
} ;


// Processes the input lines, starting from the second line (index 1).
// The first line is typically metadata and is skipped.
stdin ( ) . slice ( 1 ) . forEach ( function (  line  )   {
    // Each line is expected to contain two space-separated values:
    // a character for the suit and a number for the card rank.
    var  tmp  =  line . split ( ' ' ) ,
        M  =  tmp [ 0 ] ,  // M stores the suit character (e.g., 'S', 'H').
        N  =  + tmp [ 1 ] ;  // N stores the card rank, converted to a number.

    // Original code had a commented-out line here.
    // It would have removed the specified card from the 'full' set.
    // full[M].splice(full[M].indexOf(N), 1);
} ) ;


// Iterates through each property (suit) in the 'full' object.
for  ( var  p  in  full  )   {
    // Another commented-out line from the original source.
    // This would have printed the remaining cards for each suit.
    // console.log(full[p].map(function(num) { return p + ' ' + num; }).join("\n"));
}