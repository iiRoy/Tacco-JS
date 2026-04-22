/*
 * This JavaScript code snippet is designed to read three space-separated numbers
 * from standard input and determine if they are in strictly increasing order.
 *
 * It utilizes Node.js's 'process.stdin' to handle input.
 */

// Initiates the standard input stream, making it ready to receive data.
process  .  stdin  .  resume  (  )  ;

// Specifies the character encoding for the input stream, ensuring proper interpretation of characters.
process  .  stdin  .  setEncoding  (  'utf8'  )  ;


// Attaches an event listener to the standard input stream.
// This function will be executed whenever a 'data' event occurs (i.e., input is received).
process  .  stdin  .  on  (  'data'  ,  function  (  chunk  )
{
    // The original code contains a typo: 'chink' instead of 'chunk'.
    // As per Type I clone rules, this typo must be preserved exactly.
    // It splits the incoming data 'chink' (which should be 'chunk') by spaces
    // into an array of strings.
    var   line    =    chink  .  split  (  ' '  )  ;

    // Converts the first element of the 'line' array to a Number and assigns it to variable 'a'.
    var   a    =    Number  (  line  [  0  ]  )  ;

    // Converts the second element of the 'line' array to a Number and assigns it to variable 'b'.
    var   b    =    Number  (  line  [  1  ]  )  ;

    // Converts the third element of the 'line' array to a Number and assigns it to variable 'c'.
    var   c    =    Number  (  line  [  2  ]  )  ;

    // Checks if 'a' is strictly less than 'b' AND 'b' is strictly less than 'c'.
    // This condition verifies if the three numbers are in ascending order.
    if  (  (  a  <  b  )  &&  (  b  <  c  )  )
    {
        // If the condition is true, output 'Yes' to the console.
        console  .  log  (  'Yes'  )  ;
    }
    else
    {
        // If the condition is false (numbers are not in strictly increasing order),
        // output 'No' to the console.
        console  .  log  (  'No'  )  ;
    }
}  )  ; // End of the 'data' event handler function.