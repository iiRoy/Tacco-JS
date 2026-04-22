/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates variations in whitespace and comments only.
 */


function main(  arg  )   {
        // Declare a local variable, though it's implicitly global here
        arg2   =   parseInt(  arg  );   // Parse the input argument to an integer


        // Perform calculation: divide by 2, ceiling, then subtract 1
        console.log  (  Math.ceil(  arg2  /  2  )  -  1  )  ;
} // End of the main function

// Call the main function with input read from standard input
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;