/*
 * This JavaScript program processes numerical input.
 * It reads lines, sums the digits of each line, and prints the result.
 * The processing stops when a line starting with '0' is encountered.
 */
function  Main  (  input  )
{
  // Split the entire input string into an array of lines,
  // using the newline character as a delimiter.
  var  lines  =  input.split(  "\n"  )  ;


  // Start an infinite loop to process each line sequentially.
  // This loop will be explicitly broken out of when a specific condition is met.
  while  (  1  )
  {
    // Extract the first line from the 'lines' array using shift(),
    // then immediately split that line into an array of individual characters.
    s  =  lines.shift(  )  .split(  ""  )  ;

    // Check if the very first character of the current line is '0'.
    // If it is, this signals the termination condition for our processing loop.
    if  (  s[  0  ]  ==  0  )  break  ;

    // Process the current line:
    // 1. Map each character in the 's' array to its numerical equivalent.
    // 2. Reduce the array of numbers by summing them all together.
    // 3. Print the final sum to the console.
    console.log(  s.map(  Number  )  .reduce(  function(  x  ,  y  )
    {
      // The accumulator 'x' holds the running total, and 'y' is the current number.
      return  x  +  y  ;
    }  )  )  ;
  }
} // End of the Main function definition.


// This section of the code handles the execution environment setup.
// It reads the entire content of standard input synchronously,
// converts it to a UTF-8 string, and passes it to the Main function for processing.
Main(  require(  "fs"  )  .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;