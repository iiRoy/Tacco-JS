// This JavaScript program processes a specific input format
// to compute and output a final numerical difference.
// The primary entry point for this logic is the 'Main' function.
// It receives all necessary data through its 'input' parameter.
function   Main  (  input  )
{
  // The input is expected to be a string containing multiple lines of data.
  // This line splits the comprehensive input string into an array,
  // where each element corresponds to a line from the original input.
  var   splitInput   =   input.split  (  "\n"  )  ;

  // The very first line of the input is extracted and assigned to the variable 'n'.
  // 'n' typically signifies the total number of subsequent data entries or iterations.
  var   n   =   (  splitInput[0]  )

  // This section processes the remaining lines of the input, starting from the second line.
  // It first slices the array to exclude the first element (which is 'n').
  // Then, it maps each remaining line to a new data structure and finally sorts the entire collection.
  var   plateArray   =   splitInput.slice  (  1  )  .map  (
    function  (  e  )
    {
      // For each individual line 'e', it's further broken down.
      // The line is split based on a space character, yielding two distinct parts.
      var   splitab   =   e.split  (  " "  )

      // These two parts are then converted from strings into integer numbers.
      // A third value is computed by summing these two parsed integers.
      // The function returns a new array comprising these three numerical values.
      return   [  parseInt  (  splitab[0]  )  ,  parseInt  (  splitab[1]  )  ,  parseInt  (  splitab[0]  )  +  parseInt  (  splitab[1]  )  ]
    }
  )  .sort  (
    function  (  x  ,  y  )
    {
      // This is a custom comparison function used by the 'sort' method.
      // It dictates the order of elements within 'plateArray'.
      // The sorting criteria is based on the third element (index 2) of each inner array.

      if   (  x[2]   <   y[2]  )
      {
        // If the third element of 'x' is numerically smaller than 'y's,
        // 'x' should precede 'y' in the sorted array.
        return   -1  ;
      }

      if   (  x[2]   >   y[2]  )
      {
        // Conversely, if 'x's third element is larger than 'y's,
        // 'y' should come before 'x'.
        return   1  ;
      }

      // If both elements' third values are identical, their relative order is stable.
      return   0  ;
    }
  )

  // Initialize two accumulator variables.
  // 'aresult' will store sums based on even iterations.
  // 'bresult' will store sums based on odd iterations.
  var   aresult   =   0
  var   bresult   =   0

  // Begin the main processing loop. This loop iterates 'n' times,
  // where 'n' is derived from the first line of the input.
  for   (  var   i  =  0  ;   i  <  n  ;   i  ++  )
  {
    // Initialize temporary index variables for inner loop operations.
    var   j   =   0
    var   j0   =   0

    // This inner 'while' loop identifies a contiguous sequence of elements
    // within 'plateArray' that share the same third value as the current element 'plateArray[i]'.
    while   (  i  +  j   <   n   &&   plateArray  [  i  +  j  ]  [  2  ]   ==   plateArray  [  i  ]  [  2  ]  )
    {
      // Within this identified sequence, it searches for the element
      // that possesses the highest value at an index determined by 'i % 2'.
      if   (  plateArray  [  i  +  j  ]  [  i  %  2  ]   >   plateArray  [  i  +  j0  ]  [  i  %  2  ]  )
      {
        // If a new maximum is found, 'j0' is updated to reflect its relative position.
        j0   =   j
      }
      // Increment 'j' to advance through the current contiguous block.
      j  ++
    }

    // After the 'while' loop, if 'j0' is not zero, it implies that an element
    // other than 'plateArray[i]' within the block had a greater value at the 'i % 2' index.
    if   (  j0   !=   0  )
    {
      // In this scenario, a swap operation is performed.
      // The element at index 'i' is swapped with the element at index 'i + j0'.
      // A shallow copy using '.slice(0)' is crucial to prevent reference issues
      // and ensure independent array copies are exchanged.
      var   tmp   =   plateArray  [  i  ]  .slice  (  0  )
      plateArray  [  i  ]   =   plateArray  [  i  +  j0  ]  .slice  (  0  )
      plateArray  [  i  +  j0  ]   =   tmp
    }

    // Based on the parity of the current iteration index 'i',
    // the corresponding value from 'plateArray[i]' is added to either 'aresult' or 'bresult'.
    if   (  i  %  2   ==   0  )
    {
      // If 'i' is an even number, the first element (index 0) of 'plateArray[i]'
      // is added to 'aresult'.
      aresult   +=   plateArray  [  i  ]  [  0  ]
    }
    else
    {
      // If 'i' is an odd number, the second element (index 1) of 'plateArray[i]'
      // is added to 'bresult'.
      bresult   +=   plateArray  [  i  ]  [  1  ]
    }
  }

  // The final step involves printing the calculated difference
  // between 'aresult' and 'bresult' to the console.
  // The '%d' format specifier ensures the output is treated as a decimal integer.
  console.log  (  '%d'  ,  aresult  -  bresult  )  ;
}

// This critical line is the entry point for the execution environment.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string,
// and then passes this string as the 'input' argument to the 'Main' function.
// This line should not be altered, as it is essential for script functionality.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;