// This JavaScript code reads robot movement commands from standard input.
// It simulates a robot navigating a grid, processing a series of commands for each grid.
// The simulation continues until a specific termination signal is received.

var   input = require (  'fs'  ) . readFileSync (   '/dev/stdin'  ,  'utf8'  )  ;

// The raw input string is first trimmed of leading/trailing whitespace,
// then split into an array of lines, where each line represents a command or grid definition.
var   arr   =   input . trim ( ) . split ( "\n" ) ;


// The main processing loop, which handles multiple simulation scenarios.
// Each scenario starts with a grid definition and ends with a "0 0" signal.
while (  true  )
{
   // Retrieve the first line from the 'arr' array, which should contain
   // the width and height of the current grid, or the termination signal.
   var wh = arr . shift ( ) ;


   // Check if the current line is the termination signal "0 0".
   // If it is, the program should exit the main loop.
   if ( wh == "0 0" )
   {
      break ; // Exit the primary simulation loop.
   }


   // If not a termination signal, parse the width and height.
   // The line is split by space, and each part is converted to a Number.
   wh = wh . split ( " " ) . map ( Number ) ;


   // Assign the parsed width to variable 'w'.
   var w = wh [ 0 ] ;

   // Assign the parsed height to variable 'h'.
   var h = wh [ 1 ] ;


   // Initialize the robot's state array 'xy'.
   // xy[0]: Direction (0-3, e.g., 0=North, 1=East, 2=South, 3=West)
   // xy[1]: Current X-coordinate (horizontal position)
   // xy[2]: Current Y-coordinate (vertical position)
   // Initial state: Direction 0, Position (1,1).
   var xy = [ 0 , 1 , 1 ] ;


   // Inner loop: processes individual movement commands for the current grid.
   while (  true  )
   {
      // Extract the next command line from the input array.
      var ary = arr . shift ( ) . split ( " " ) ;


      // If the command has two parts, the second part is a numerical value.
      // This line converts the second part (ary[1]) from string to number.
      if ( ary . length == 2 )
      {
         ary [ 1 ] = ary [ 1 ] - 0 ; // Subtraction with 0 is a common JS trick for type conversion.
      }


      // Check if the current command is "STOP".
      // If it is, the robot has finished its movements for the current grid.
      if ( ary [ 0 ] == "STOP" )
      {
         break ; // Exit the inner command processing loop.
      }


      // Handle "RIGHT" turn command.
      // Increments the direction. If direction exceeds 3, it wraps around to 0.
      if ( ary [ 0 ] == "RIGHT" )
      {
         xy [ 0 ] ++ ;
         if ( xy [ 0 ] == 4 )
         {
            // Note: This appears to be a typo in the original code, 'x[0]' instead of 'xy[0]'.
            // Per Type I cloning rules, this must be preserved exactly as is.
            x [ 0 ] = 0 ;
         }
      }


      // Handle "LEFT" turn command.
      // Decrements the direction. If direction goes below 0, it wraps around to 3.
      if ( ary [ 0 ] == "LEFT" )
      {
         xy [ 0 ] -- ;
         if ( xy [ 0 ] == -1 )
         {
            // Note: Similar typo, 'x[0]' instead of 'xy[0]'. Preserved.
            x [ 0 ] = 3 ;
         }
      }


      // Handle "FORWARD" movement command.
      // The robot moves forward by the specified number of steps (ary[1]).
      if ( ary [ 0 ] == "FORWARD" )
      {
         // Loop for each step of the forward movement.
         while ( ary [ 1 ] -- )
         {
            // Adjust coordinates based on current direction.
            if ( xy [ 0 ] == 0 )
            {
               xy [ 2 ] ++ ; // Moving 'Up' (Y increases)
            }
            if ( xy [ 0 ] == 1 )
            {
               xy [ 1 ] ++ ; // Moving 'Right' (X increases)
            }
            if ( xy [ 0 ] == 2 )
            {
               xy [ 2 ] -- ; // Moving 'Down' (Y decreases)
            }
            if ( xy [ 0 ] == 3 )
            {
               xy [ 2 ] -- ; // Moving 'Left' (Y decreases? Potentially specific coordinate system or bug).
            }
         }
      }


      // Handle "BACKWARD" movement command.
      // The robot moves backward by the specified number of steps (ary[1]).
      if ( ary [ 0 ] == "BACKWARD" )
      {
         // Loop for each step of the backward movement.
         while ( ary [ 1 ] -- )
         {
            // Adjust coordinates based on current direction (opposite of forward).
            if ( xy [ 0 ] == 0 )
            {
               xy [ 2 ] -- ; // Moving 'Down' (Y decreases)
            }
            if ( xy [ 0 ] == 1 )
            {
               xy [ 1 ] -- ; // Moving 'Left' (X decreases)
            }
            if ( xy [ 0 ] == 2 )
            {
               xy [ 2 ] ++ ; // Moving 'Up' (Y increases)
            }
            if ( xy [ 0 ] == 3 )
            {
               xy [ 1 ] ++ ; // Moving 'Right' (X increases? Potentially specific coordinate system or bug).
            }
         }
      }


      // Boundary check: Ensure the robot's X-coordinate (xy[1]) does not go below 1.
      if ( xy [ 1 ] < 1 )
      {
         xy [ 1 ] = 1 ;
      }

      // Boundary check: Ensure the robot's Y-coordinate (xy[2]) does not go below 1.
      if ( xy [ 2 ] < 1 )
      {
         xy [ 2 ] = 1 ;
      }

      // Boundary check: Ensure the robot's X-coordinate (xy[1]) does not exceed the grid width 'w'.
      if ( xy [ 1 ] > w )
      {
         xy [ 1 ] = w ;
      }

      // Boundary check: Ensure the robot's Y-coordinate (xy[2]) does not exceed the grid height 'h'.
      if ( xy [ 2 ] > h )
      {
         xy [ 2 ] = h ;
      }
   } // End of inner while loop for robot commands.


   // After processing all commands for a grid, remove the direction component (xy[0]).
   // The 'shift()' method removes the first element from the array.
   xy . shift ( ) ;


   // Output the final X and Y coordinates, separated by a space.
   console . log ( xy . join ( " " ) ) ;

} // End of outer while loop for grid scenarios.

// End of script execution.