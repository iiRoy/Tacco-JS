/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * The primary entry point for execution is the 'Main' function.
 * It processes input data to determine a 'War' or 'No War' scenario.
 */
function   Main   ( input )
{
  /*
   * The input string is first split into an array of lines.
   * Each element of the 'input' array will then correspond to a line
   * from the original input data.
   */
    input =   input.split ( "\n" ) ;

    // Parse the first line to get the initial parameters
      lineTop   =   input [ 0 ] .split ( " " ) ;
    // Parse the second line for X coordinates
      lineX     =   input [ 1 ] .split ( " " ) ;
    // Parse the third line for Y coordinates
      lineY     =   input [ 2 ] .split ( " " ) ;

    /*
     * When converting string values to integers (base 10),
     * it is crucial to use the parseInt() function.
     * This ensures correct numerical operations.
     */
    var   n   =   parseInt (   lineTop [ 0 ]   ,   10   ) ;
    var   m   =   parseInt (   lineTop [ 1 ]   ,   10   ) ;
    var   x   =   parseInt (   lineTop [ 2 ]   ,   10   ) ;
    var   y   =   parseInt (   lineTop [ 3 ]   ,   10   ) ;


    var   maxX   =   x ;
    var   minY   =   y ;


    for   (   var   work   of   lineX   )
    {
        // Iterate through all elements in lineX to find the maximum X coordinate.
        if   (   parseInt (   work   )   >   parseInt (   maxX   )   )
        {
            // If the current element is greater, update maxX.
            maxX   =   work ;
        }
    }


    for   (   var   work   of   lineY   )
    {
        // Iterate through all elements in lineY to find the minimum Y coordinate.
        if   (   parseInt (   work   )   <   parseInt (   minY   )   )
        {
            // If the current element is smaller, update minY.
            minY   =   work ;
        }
    }


    // Perform the final comparison to determine the outcome.
    if   (   parseInt (   minY   )   <=   parseInt (   maxX   )   )
    {
        // If the condition is met, output 'War'.
        console . log (   'War'   ) ;
    }
    else
    {
        // Otherwise, output 'No War'.
        console . log (   'No War'   ) ;
    }

} /* End of Main function definition */


/*
 * DO NOT MODIFY THE FOLLOWING SECTION OF CODE.
 * This part handles reading input from standard input and invoking the Main function.
 * It is essential for the automated testing environment.
 */
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   ) ;