/*
 * This JavaScript code reads input from stdin, processes it,
 * and outputs results to stdout. It simulates movement
 * within a defined grid.
 */
var    input    =    require (  'fs'  ) .  readFileSync (  '/dev/stdin'  ,  'utf8'  ) ; // Read all input synchronously

var arr  =  input .  trim ( ) .  split ( "\n" ) ; /* The input lines are stored here.
                                                    Each element is a line from the input. */

while ( true ) { // Main loop for processing multiple test cases
  
  var wh  =  arr .  shift ( ) ; // Get the dimensions line for the current test case
  
  // Check for the termination condition "0 0"
  if ( wh  ==  "0 0" )
    break ;
  
  wh  =  wh .  split ( " " ) .  map ( Number ) ; // Parse width and height from the line
  
  var w  =  wh [ 0 ] ; // Assign width
  var h  =  wh [ 1 ] ; // Assign height
  
  /*
   * Initialize robot's state:
   * xy[0]: current direction (0=N, 1=E, 2=S, 3=W)
   * xy[1]: current x-coordinate
   * xy[2]: current y-coordinate
   */
  var    xy    =    [ 0 ,  1 ,  1 ] ;
  
  while ( true ) { /* Inner loop to process commands for the current test case */
    
    var    ary    =    arr .  shift ( ) .  split ( " " ) ; // Get the next command line
    
    // Convert the second argument to a number if it exists and is a length
    if ( ary .  length  ==  2 ) {
      ary [ 1 ]  =  ary [ 1 ]  -  0 ; // Coerce to number using subtraction
    }
    
    // Check for the "STOP" command to end the current test case
    if ( ary [ 0 ]  ==  "STOP" ) {
      break ;
    }
    
    // Handle "RIGHT" turn command
    if ( ary [ 0 ]  ==  "RIGHT" ) {
      xy [ 0 ] ++ ; // Increment direction
      if ( xy [ 0 ]  ==  4 ) {
        x [ 0 ]  =  0 ; // Wrap around if direction exceeds 3 (typo: should be xy[0])
      }
    }
    
    // Handle "LEFT" turn command
    if ( ary [ 0 ]  ==  "LEFT" ) {
      xy [ 0 ] -- ; // Decrement direction
      if ( xy [ 0 ]  ==  -1 ) {
        x [ 0 ]  =  3 ; // Wrap around if direction goes below 0 (typo: should be xy[0])
      }
    }
    
    // Handle "FORWARD" movement command
    if ( ary [ 0 ]  ==  "FORWARD" ) {
      while ( ary [ 1 ] -- ) { // Loop for the specified number of steps
        
        // Move according to current direction
        if ( xy [ 0 ]  ==  0 )
          xy [ 2 ] ++ ; // North: increase y
        if ( xy [ 0 ]  ==  1 )
          xy [ 1 ] ++ ; // East: increase x
        if ( xy [ 0 ]  ==  2 )
          xy [ 2 ] -- ; // South: decrease y
        if ( xy [ 0 ]  ==  3 )
          xy [ 2 ] -- ; // West: decrease y (typo: should be xy[1]--)
        
      }
    }
    
    // Handle "BACKWARD" movement command
    if ( ary [ 0 ]  ==  "BACKWARD" ) {
      while ( ary [ 1 ] -- ) { // Loop for the specified number of steps
        
        // Move backward according to current direction
        if ( xy [ 0 ]  ==  0 )
          xy [ 2 ] -- ; // North: decrease y (backward)
        if ( xy [ 0 ]  ==  1 )
          xy [ 1 ] -- ; // East: decrease x (backward)
        if ( xy [ 0 ]  ==  2 )
          xy [ 2 ] ++ ; // South: increase y (backward)
        if ( xy [ 0 ]  ==  3 )
          xy [ 1 ] ++ ; // West: increase x (backward)
        
      }
    }
    
    // Boundary checks for x-coordinate
    if ( xy [ 1 ]  <  1 )
      xy [ 1 ]  =  1 ;
    
    if ( xy [ 1 ]  >  w )
      xy [ 1 ]  =  w ;
    
    // Boundary checks for y-coordinate
    if ( xy [ 2 ]  <  1 )
      xy [ 2 ]  =  1 ;
    
    if ( xy [ 2 ]  >  h )
      xy [ 2 ]  =  h ;
    
  } // End of inner while loop (commands)
  
  xy .  shift ( ) ; // Remove the direction component from xy array
  
  console .  log ( xy .  join ( " " ) ) ; // Output the final x and y coordinates
  
} // End of outer while loop (test cases)
/*
 * End of program logic.
 * The script will terminate when the input stream is exhausted
 * or a "0 0" dimension line is encountered.
 */