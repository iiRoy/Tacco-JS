/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects, variable names, and logic are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */
function  main  (  input  )   {
  // The 'args' constant will hold an array of lines from the input string.
  const  args  =  input.split  (  /\\n/  )  ;


  /*
   * N is the first line, often representing the count of items.
   * nums is an array of the actual data lines, excluding the first and last (which might be an empty line).
   */
  const  N  =  args [  0  ]  ,
        nums  =  args.slice  (  1  ,  args.length  -  1  )  ;

  // This line calculates and prints the number of unique elements in the 'nums' array.
  // It achieves this by filtering the array to keep only the first occurrence of each element.
  console.log  (  nums.filter  (  (  n  ,  i  )  =>  nums.indexOf  (  n  )  ===  i  )  .length  )  ;
} // End of main function

// Calls the main function with input read synchronously from standard input.
// This uses Node.js's 'fs' module to read the file.
main  (  require  (  'fs'  )  .readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;