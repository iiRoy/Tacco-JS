/*
 * This JavaScript file processes input lines to solve a specific problem.
 * It uses the 'readline' module to handle standard input and output.
 */

// Declare an array to hold all the input lines read from stdin.
  var   lines    =    [];

// Import the 'readline' module, which provides an interface for reading data from a Readable stream.
  var   readline    =    require(   'readline'   )   ;

// Create a readline interface instance.
// This instance will listen for input on 'process.stdin' and output to 'process.stdout'.
  var   rl    =    readline.createInterface(   {
      input    :    process.stdin    ,   // Specify the input stream as standard input.
      output    :    process.stdout    ,   // Specify the output stream as standard output.
  }   )   ;

// Attach an event listener for the 'line' event.
// This function will be called every time a new line of input is received.
  rl  .  on(  'line'  ,  function  (  x  )   {
      lines.push(   x   )   ; // Add the received line (x) to the 'lines' array.
  }   )   ;


// Attach an event listener for the 'close' event.
// This function will be called when the input stream ends (e.g., Ctrl+D or EOF).
  rl  .  on(  'close'  ,  function  (  )   {

      // Parse the first line of input as an integer, representing N.
      var   N    =    Number(   lines[0]   )   ;

      // Parse the second line of input.
      // It's a space-separated string of numbers, which are then converted to an array of numbers.
      var   A    =    lines[1].split(   " "   )   .   map(   i   =>   Number(   i   )   )   ;

      // Add dummy elements to the beginning and end of array A.
      // This helps in simplifying boundary conditions for calculations.
      A.unshift(   0   )   ;
      A.push(   0   )   ;

      // Initialize a variable to store the total sum of absolute differences.
      var   Sum    =    0   ;

      // Loop through the array A to calculate the initial total path length.
      // This represents the sum of absolute differences between adjacent elements.
      for   (   var   i    =    1   ;   i    <    N   +   2   ;   i++   )   {
          Sum   +=   Math.abs(   A[i]   -   A[i   -   1]   )   ; // Add the absolute difference between current and previous element.
      }


      // Iterate from 1 to N (inclusive) to calculate the modified sum for each possible removal.
      for   (   var   i    =    1   ;   i    <    N   +   1   ;   i++   )   {

          // Calculate the 'ans' for the current iteration.
          // This involves subtracting the distances involving A[i] and adding the distance if A[i] were removed.
          var   ans    =    Sum    -    (   Math.abs(   A[i]   -   A[i   -   1]   )    +    Math.abs(   A[i   +   1]   -   A[i]   )   )    +    Math.abs(   A[i   -   1]   -   A[i   +   1]   )   ;

          // Print the calculated 'ans' to the console.
          console.log(   ans   )   ;
      }

  }   )   ;