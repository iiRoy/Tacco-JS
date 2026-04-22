/*
 * This program demonstrates reading input, processing an array,
 * and printing a reversed sequence of numbers to standard output.
 * It's a simple example of array manipulation in JavaScript.
 */
function   main  (  input  )

{
    // Step 1: Parse the input.
    // The input string is expected to contain multiple lines.
    // We split the input by newline characters to get an array of lines.
    var   temp   =   input  .  split  (  '\n'  )  ;

    // Step 2: Extract and process the array of numbers.
    // The second line of input (index 1) contains space-separated numbers.
    // We split this line by space and then convert each part to a Number.
    var   arr   =   temp  [  1  ]  .  split  (  ' '  )  .  map  (  Number  )  ;

    // Initialize an empty string to accumulate the reversed sequence.
    var   answer   =   ""  ;

    // Step 3: Iterate and build the reversed string.
    // The first line of input (index 0) contains the count of numbers.
    // We parse it to an integer and loop backwards from this count down to 1.
    for  (  var   i   =   parseInt  (  temp  [  0  ]  )  ;   i   >   0  ;   i  --  )
    {
        // Append the element at index (i-1) from 'arr' to the 'answer' string,
        // followed by a space to separate the numbers.
        // This accesses the elements in reverse order.
        answer   +=   arr  [  (  i  -  1  )  ]   +   ' '  ;
    }

    // Step 4: Output the result.
    // Print the final 'answer' string to the console.
    // .trim() is used to remove any trailing space after the last number.
    console  .  log  (  answer  .  trim  (  )  )  ;
}


// This part of the script handles reading the input from standard input
// in a Node.js environment.
// It uses the 'fs' (file system) module to read the entire content
// of '/dev/stdin' as a UTF-8 encoded string.
var   x   =   require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf-8'  )  ;

// Finally, call the main function with the data read from stdin.
main  (  x  )  ;

// End of the script.
// This is a Type I clone, meaning only whitespace and comments have been altered.