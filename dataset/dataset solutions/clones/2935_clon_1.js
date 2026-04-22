/*
 * This JavaScript function processes input data to find a specific range.
 * The 'input' parameter is expected to contain the entire input string.
 */
function   Main   (   input   )   {

  // Split the input string by newline characters to get individual lines.
  input   =   input   .   split   (   "\n"   )   ;

  // Process the first line to get initial parameters N and M.
  let   temp   =   input   [0]   .   split   (   " "   )   ;

  // N is the first value from the first line.
  var   N   =   temp   [0]   ;
  // M is the second value from the first line.
  var   M   =   temp   [1]   ;

  // Initialize arrays L and R with size M.
  var   L   =   Array   (   M   )   ;
  var   R   =   Array   (   M   )   ;


  // Loop through the subsequent M lines of input.
  for   (   var   i   =   1   ;   i   <=   M   ;   i   ++   )   {
    // Split each line by space to get two values.
    temp   =   input   [i]   .   split   (   " "   )   ;
    // Store the first value in L (adjusting index for 0-based array).
    L   [i-1]   =   temp   [0]   ;
    // Store the second value in R.
    R   [i-1]   =   temp   [1]   ;
  }

  // Initialize 'max' with the first element of L.
  var   max   =   L   [0]   ;
  // Initialize 'min' with the first element of R.
  var   min   =   R   [0]   ;


  // Iterate through array L to find the maximum value.
  L   .   forEach   (   (   value   ,   index   )   =>   {
    // If current value is greater than the current max, update max.
    if   (   value   >   max   )   {
      max   =   value   ;
    }
  }   )   ;

  // Iterate through array R to find the minimum value.
  R   .   forEach   (   (   value   ,   index   )   =>   {
    // If current value is less than the current min, update min.
    if   (   value   <   min   )   {
      min   =   value   ;
    }
  }   )   ;

  // Calculate the result: min - max + 1.
  // If the result is positive, print it.
  if   (   min   -   max   +   1   )   {
    console   .   log   (   min   -   max   +   1   )   ;
  }   else   {
    // Otherwise, if the range is invalid or non-positive, print 0.
    console   .   log   (   0   )   ;
  }

}

// Read input from standard input and pass it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;