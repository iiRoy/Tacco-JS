/*
 * This is an example of a Type I code clone.
 * All logic and structure remain identical.
 * Only whitespace and comments have been altered significantly.
 */
var input = require(  'fs'  ) .  readFileSync(   '/dev/stdin'  , 'utf8'   ) ;

  // Initialize an array by reading input and splitting it by newlines.
  var arr = input .  trim() .  split(  "\n"  ) ;

  var str = ""; // Initialize an empty string to build the output.

  // Main loop to process input lines until a specific termination condition is met.
  while (true)  {
     // Retrieve the next line from the array.
     var x = arr .  shift(  ) ;

     // Check for the termination condition: "0 0"
     if (x == "0 0")
        break; // Exit the loop if the condition is met.

     // Parse the line into an array of numbers.
     var ary = x .  split(  " "  ) .  map(  Number  ) ;

     /*
      * Construct a row of '#' characters and append it to the main string.
      * The number of '#' characters is determined by ary[1].
      * The number of rows is determined by ary[0].
      */
     str += Array(  ary[0] + 1  ) .  join(  (  Array(  ary[1] + 1  ) .  join(  "#"  )  ) + "\n"  ) ;

     // Add an additional newline for spacing between blocks.
     str += "\n"  ;
  }

  // Finally, print the accumulated string to the console after trimming any trailing whitespace.
  console .  log(  str .  trim(  )  ) ;