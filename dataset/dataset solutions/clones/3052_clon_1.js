/*
 * This file processes input data to identify a specific pattern.
 * It defines two main functions: setUp for initialization and main for core logic.
 * The goal is to count how many times a sequence of non-decreasing values occurs.
 */

// Function responsible for preparing the input data.
function  setUp  (  input  )   {

  // The raw input string is first split into an array of lines.
  input  =  input . split ( "\n" ) ;

  // The first line of input is expected to be a number, assigned to global variable N.
  N  =  Number ( input [ 0 ] ) ;

  // The second line is a space-separated string of numbers.
  // This string is split, and each part is converted to a numeric type, forming Hlist.
  Hlist  =  input [ 1 ] . split ( " " ) . map (  function  (  d ,  i  )   {
    // Convert the current string element 'd' into a numeric value.
    return  Number ( d ) ;
  } ) ;

  // Once the setup is complete, the main processing function is called.
  main ( ) ;
}


// The primary function where the core logic of the application resides.
function  main  (  )   {

  // Initialize a counter variable to keep track of the non-decreasing segments.
  var   count   =   0 ;
  // Initialize a variable to store the current highest value encountered in a segment.
  var   current   =   0 ;

  // Iterate over each element in the globally accessible Hlist array.
  Hlist . forEach (  function  (  d ,  i  )   {
    // Check if the current element 'd' is greater than or equal to the 'current' maximum.
    if  (  current   <=   d  )   {
      // If the condition is true, increment the count as a new non-decreasing step is found.
      count ++ ;
      // Update 'current' to the value of 'd' to reflect the new highest point in the segment.
      current   =   d ;
    }
  } ) ;

  // After iterating through all elements, print the final calculated count to the console.
  console . log ( count ) ;
}

// --- Application Execution Start ---
// This line reads the input from the standard input stream (e.g., from a file or pipe).
// The content is read as a UTF-8 encoded string and then passed to the setUp function.
setUp (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;