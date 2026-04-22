/*
 * This is the main entry point for the program.
 * It processes the input and calculates the result.
 */
function  main (  input  ) {
  // Enforce strict mode for cleaner code and error prevention.
  "use strict";


  // Split the entire input string by newline characters to get individual lines.
  const  lines  =  input . split ( "\n" ) ;

  /*
   * The first line contains two space-separated values: L and N.
   * We parse them as numbers.
   */
  const  firstLine  =  lines [ 0 ] . split ( " " ) . map ( ( value )  =>  + value ) ;

  // L represents the length of the circle.
  const  L  =  firstLine [ 0 ] ;

  // N represents the number of ants.
  const  N  =  firstLine [ 1 ] ;


  /*
   * Extract the remaining lines, filter out any empty strings,
   * and convert them to numbers. These represent the positions of the ants.
   */
  let  xn  =  lines . slice ( 1 )
                   . filter ( ( value )  =>  value )
                   . map ( ( value )  =>  + value ) ;


  // This array will store the total costs for each possible path.
  let  costs  =  [ ] ;

  /**
   * Recursive function to search for the optimal path.
   * x: current position on the circle.
   * xn: remaining ant positions to visit.
   * sum: current accumulated distance.
   */
  const  search  =  (  x ,  xn ,  sum  )  =>  {
    // Base case: if all ants have been visited, record the total sum.
    if  (  xn . length  ===  0  )  {
      costs . push ( sum ) ;
      return ;
    }

    // Calculate distance if we move to the leftmost remaining ant.
    // This involves handling the circular nature (L - x + xn[0]).
    const  leftDistance  =  xn [ 0 ]  >=  x
                          ?  xn [ 0 ]  -  x
                          :  (  L  -  x  )  +  xn [ 0 ] ;

    // Calculate distance if we move to the rightmost remaining ant.
    // Again, handle the circular wrap-around.
    const  rightDistance  =  xn [ xn . length  -  1 ]  <=  x
                           ?  x  -  xn [ xn . length  -  1 ]
                           :  x  +  (  L  -  xn [ xn . length  -  1 ]  ) ;

    // Create a copy of the remaining ants for the left path.
    const  left  =  xn . concat ( ) ;
    // Get the leftmost ant's position and remove it from the copy.
    const  leftX  =  left . shift ( ) ;

    // Create another copy for the right path.
    const  right  =  xn . concat ( ) ;
    // Get the rightmost ant's position and remove it from the copy.
    const  rightX  =  right . pop ( ) ;

    // Recursively call search for the left path.
    search ( leftX ,  left ,  sum  +  leftDistance ) ;

    // Recursively call search for the right path.
    search ( rightX ,  right ,  sum  +  rightDistance ) ;
  }


  // Start the search from position 0 with an initial sum of 0.
  // The initial 'xn' contains all ant positions.
  search ( 0 ,  xn ,  0 ) ;


  // After exploring all paths, find the maximum cost (distance) among them.
  console . log ( Math . max . apply ( null , costs ) ) ;
}

// Read input from stdin and pass it to the main function.
main (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;