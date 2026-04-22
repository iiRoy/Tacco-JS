// This is a self-executing anonymous function, also known as an IIFE (Immediately Invoked Function Expression).
// Its primary purpose is to process a series of numbers, simulating a stack.

( function ( input ) {
  /*
   * The 'input' parameter receives the raw string data.
   * First, we ensure no trailing newline character interferes with processing.
   * Then, the string is divided into individual lines based on the newline delimiter.
   * Each resulting line string is subsequently converted into a numerical value.
   * This array of numbers, representing the sequence of operations/values, is assigned to 'p'.
   */
  var p = input .replace ( /\n$/, '' ) .split ( '\n' ) .map ( Number ) ;


  // Initialize an empty array. This array will act as our custom stack data structure.
  var array = [ ] ;


  // Begin a loop that continues as long as there are elements remaining in the 'p' array.
  // This array 'p' holds the input sequence.
  while ( p .length > 0 )
  {
    // Extract the first element from the 'p' array.
    // This element, 'n', represents the current number to be processed.
    var n = p .shift ( ) ;


    // Check if the extracted number 'n' is exactly equal to 0.
    // A value of 0 is a special indicator for a stack 'pop' operation.
    if ( n === 0 )
    {
      // If 'n' is 0, retrieve and remove the last element from our 'array' stack.
      // This popped element is then immediately printed to the console.
      console .log ( array .pop ( ) ) ;

      // After performing the pop and print, skip the rest of the current loop iteration.
      // Proceed directly to the next element in 'p'.
      continue ;
    }

    // If 'n' is not 0, it signifies a number that needs to be added to our stack.
    // Push the number 'n' onto the end of the 'array'.
    array .push ( n ) ; // This effectively adds 'n' to the top of our stack.
  }

} ) (
  // This is the argument passed to the IIFE.
  // It uses the Node.js 'fs' module to synchronously read the content of '/dev/stdin'.
  // The content is read as a UTF-8 encoded string.
  require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' )
) ; // End of the Immediately Invoked Function Expression.