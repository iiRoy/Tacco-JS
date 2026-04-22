// This is the main function definition. It takes the raw input string.
function   main ( input )
{

  /*
   * The first line of input contains N (number of points) and D (maximum distance).
   * Subsequent lines contain the coordinates of each point.
   * We parse the input string into N, D, and an array of point arrays.
   */
  const  [ [ N , D ] , ... pList ]   =   input . split ( '\n' ) . map ( str   =>   str . split ( ' ' ) . map ( Number ) ) ;


  let    count    =    0    ;   // Initialize a counter for points that satisfy the condition.


  // Iterate over each point in the parsed list of points.
  pList . forEach ( val   =>
  {
      // Destructure the current point's coordinates into x and y.
      const   [ x , y ]   =   val   ;


      /*
       * Calculate the Euclidean distance of the point (x, y) from the origin (0, 0).
       * The formula is sqrt(x^2 + y^2).
       * If this distance is less than or equal to D, increment the counter.
       * The '&& count++' is a short-circuit evaluation that increments only if the condition is true.
       */
      Math . sqrt ( x   *   x   +   y   *   y )   <=   D   &&   count ++   ;

  } ) ;


  // Print the final count to the console.
  console . log ( count ) ;


}


// This block reads the input from standard input and calls the main function.
// 'fs' module is used for file system operations, 'readFileSync' reads the file synchronously.
// '/dev/stdin' is the standard input stream on Unix-like systems.
// 'utf8' specifies the encoding.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;