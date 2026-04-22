/*
 * This is the main function definition.
 * It takes 'input' as a single string argument.
 */
function     Main (  input )
{

    // Step 1: Split the entire input string by newline characters.
    // This transforms the 'input' string into an array of strings,
    // where each element is a line from the original input.
    input  =  input.split  (  '\n'  )


    // Step 2: Extract the very first element (line) from the array
    // and reassign it back to the 'input' variable.
    // IMPORTANT: After this line, 'input' is no longer an array of lines,
    // but rather a *single string* (the first line of the original input).
    input   =   input.shift ( ) ;



    // Step 3: Process the now-single 'input' string.
    // The .map() method called on a string iterates over its individual characters.
    // So, 'e' in the outer map function will be a single character.
    input  =  input.map ( function  (  e  )
    {
        // For each character 'e':
        // - e.split(' '): Splits the character by space.
        //   If 'e' is not a space, this results in an array containing 'e' itself (e.g., ['1']).
        //   If 'e' *is* a space, it results in ['', ''] (e.g., ' '.split(' ') -> ['', '']).
        // - .map(function(e){ return parseInt(e, 10); }):
        //   This inner map attempts to parse each element of the resulting array as an integer.
        //   If 'e' was '1', it becomes [1]. If 'e' was ' ', it becomes [NaN, NaN].
        // The overall effect is that the original single input string is transformed
        // into an array of arrays of numbers (or NaNs).
            return   e.split  (  ' '  )  .  map  (  function  (  e  )
            {
                return   parseInt  (  e  ,  10  ) ;
            }  )  ;

    }  )  ;



    // Step 4: Initialize a variable 'r' to accumulate the result.
    var  r  =  0 ;


    // Step 5: Iterate over the processed 'input' (which is now an array of arrays,
    // where each inner array is expected to contain two numbers, representing a range).
    input.forEach  (  function  (  e  )
    {
        // For each inner array 'e' (e.g., [start, end]),
        // calculate the number of integers in the range [start, end] inclusive.
        // This is typically (end - start + 1).
        r  +=  (  e[1]  -  e[0]  +  1  )  ;
    }  )  ;


    // Step 6: Output the final accumulated result 'r' to the console.
    // The '%d' format specifier ensures it's printed as a decimal integer.
    console.log  (  '%d'  ,  r  )  ;

} // End of the Main function block.


// This is the entry point of the script execution.
// It reads the entire content from standard input ("/dev/stdin"),
// decodes it as UTF-8, and then calls the 'Main' function with this content.
Main (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;