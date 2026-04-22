/* This is an extensively modified Type I clone
 * of the original JavaScript code.
 * Only whitespace and comments have been altered.
 */
function   Main   (   input   )
{
  // Declare a variable to hold lines of input data.
  var   dataList   =   input . split ( "\n" ) ;

  // Remove the last element, typically an empty string from a trailing newline.
  dataList . pop ( ) ;

  // Split the first line of data by spaces to get numerical parameters.
  var   data   =   dataList [ 0 ] . split ( " " ) ;

  // Parse the first parameter as the number of jewels.
  var   jwellNum   =   parseInt ( data [ 0 ] ) ;

  // Parse the second parameter as the number of operations allowed.
  var   operationNum   =   parseInt ( data [ 1 ] ) ;


  // Process the second line to get the initial jewel values.
  // Each string is mapped to an integer.
  var   jwells   =   dataList [ 1 ] . split ( " " ) . map (   str   =>   parseInt ( str )   ) ;


  // Variable to store the maximum sum of jewels found during operations.
  var   max   =   0 ;

  // Variable to store the current sum of jewels held in 'hands'.
  var   total   =   0 ;


  // This variable will temporarily store state copies for recursive calls.
  var   copyState   =   null ;


  // Initiate the recursive operation process.
  // The initial state has all jewels in the 'dequeue' and 'hands' empty.
  // The operation counter starts at 1.
  operate ( {   dequeue :   jwells . slice ( ),   hands :   [ ]   },   1   ) ;


  /**
   * Recursive helper function to simulate jewel manipulations.
   * It explores different ways to move jewels between a dequeue and hands.
   *
   * @param {object} state      - The current configuration: an object with 'dequeue' (array of remaining jewels)
   *                                and 'hands' (array of jewels currently held).
   * @param {number} openum     - The current operation count.
   * @returns {null}            - Returns null when the operation limit is reached, signifying termination of a path.
   */
  function   operate   (   state ,   openum   )
  {
    // Check if the maximum allowed operations have been exceeded.
    if   (   openum   >   operationNum   )   return   null ;


    // --- Section for operations where jewels are moved from the dequeue to hands ---
    // These operations are only possible if there are jewels remaining in the dequeue.
    if   (   state . dequeue . length   !==   0   )
    {
      // First type of move: take a jewel from the front of the dequeue.
      copyState   =   {   dequeue :   state . dequeue . slice ( ),   hands :   state . hands . slice ( )   } ;
      copyState . hands [ copyState . hands . length ]   =   copyState . dequeue . shift ( ) ; // `shift` removes from front.

      // Recalculate the sum of jewels currently in hand after this move.
      total   =   0 ;
      for   (   var   i   =   0 ,   len   =   copyState . hands . length ;   i   <   len ;   i++   )   total   =   total   +   copyState . hands [ i ] ;

      // Update the global maximum if the current total is greater.
      if   (   max   <   total   )   max   =   total ;

      // Recursively call 'operate' with the new state and incremented operation number.
      operate (   copyState ,   openum   +   1   ) ;


      // Second type of move: take a jewel from the back of the dequeue.
      copyState   =   {   dequeue :   state . dequeue . slice ( ),   hands :   state . hands . slice ( )   } ;
      copyState . hands [ copyState . hands . length ]   =   copyState . dequeue . pop ( ) ; // `pop` removes from back.

      // Recalculate the sum of jewels in hand.
      total   =   0 ;
      for   (   var   i   =   0 ,   len   =   copyState . hands . length ;   i   <   len ;   i++   )   total   =   total   +   copyState . hands [ i ] ;

      // Update the global maximum.
      if   (   max   <   total   )   max   =   total ;

      // Recursive call for this path.
      operate (   copyState ,   openum   +   1   ) ;
    }


    // --- Section for operations where jewels are moved from hands back to the dequeue ---
    // These operations iterate through each jewel currently held in 'hands'.
    for   (   var   j   =   0 ,   len   =   state . hands . length ;   j   <   len ;   j++   )
    {
      // Third type of move: put a jewel from hands back to the front of the dequeue.
      copyState   =   {   dequeue :   state . dequeue . slice ( ),   hands :   state . hands . slice ( )   } ;
      // `splice(j, 1)[0]` removes the jewel at index `j` from hands.
      // `unshift` adds it to the front of the dequeue.
      copyState . dequeue . unshift (   copyState . hands . splice ( j ,   1 ) [ 0 ]   ) ;

      // Recalculate the sum of jewels remaining in hand.
      total   =   0 ;
      for   (   var   i   =   0 ,   len   =   copyState . hands . length ;   i   <   len ;   i++   )   total   =   total   +   copyState . hands [ i ] ;

      // Update the global maximum.
      if   (   max   <   total   )   max   =   total ;

      // Recursive call for this path.
      operate (   copyState ,   openum   +   1   ) ;


      // Fourth type of move: put a jewel from hands back to the back of the dequeue.
      copyState   =   {   dequeue :   state . dequeue . slice ( ),   hands :   state . hands . slice ( )   } ;
      // `splice(j, 1)[0]` removes the jewel at index `j` from hands.
      // `push` adds it to the back of the dequeue.
      copyState . dequeue . push (   copyState . hands . splice ( j ,   1 ) [ 0 ]   ) ;

      // Recalculate the sum of jewels remaining in hand.
      total   =   0 ;
      for   (   var   i   =   0 ,   len   =   copyState . hands . length ;   i   <   len ;   i++   )   total   =   total   +   copyState . hands [ i ] ;

      // Update the global maximum.
      if   (   max   <   total   )   max   =   total ;

      // Recursive call for this path.
      operate (   copyState ,   openum   +   1   ) ;
    }
  }

  // After all possible operation paths are explored, print the highest sum found.
  console . log (   max   ) ;
}

// This section handles reading standard input and invoking the main processing function.
// It uses Node.js 'fs' module to read the entire content of '/dev/stdin' as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;