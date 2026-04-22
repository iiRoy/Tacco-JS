/*
 * This JavaScript program simulates the path of a robot.
 * The robot moves 1 unit in a direction, then turns by 'z' degrees.
 * The simulation continues until the robot returns to its starting point (0,0).
 * Finally, it outputs the total number of steps taken to reach the origin.
 */

function Main ( input )
{
    // The input string is expected to contain parameters separated by newlines.
    // For this problem, only the first line (input[0]) is initially used for 'z'.
    input = input.split( "\n" ) ;


    // Parse the initial value for 'z' from the first line of input.
    var z = parseInt( input[0] , 10 ) ;


    // IMPORTANT: The value of 'z' is immediately overridden to a fixed value of 90.
    // This means the robot will always turn 90 degrees clockwise after each step.
    z = 90


    // Initialize the robot's current position (x, y coordinates).
    var x = 0 ;
    var y = 0 ;

    // An object to potentially store coordinates, though x and y are used directly.
    var coordinate = { x : 0 , y : 0 } ;

    // Set the robot's initial direction. 90 degrees typically means North in a
    // standard Cartesian coordinate system (increasing Y).
    var direction = 90 ;


    // Initialize a counter to keep track of the number of steps the robot takes.
    var count = 0 ;


    // Begin the main simulation loop. This loop runs indefinitely
    // until an explicit 'break' statement is encountered.
    while ( true )
    {

        // Increment the step counter for the current movement.
        count ++

        // Determine the robot's movement based on its current direction.
        // Each step moves the robot 1 unit in the specified direction.
        switch ( direction )
        {
            case 90 : // If direction is 90 degrees (North).
                y += 1 ; // Move one unit up (increase y-coordinate).
                break // Exit the switch statement.

            case 180 : // If direction is 180 degrees (East).
                x += 1 ; // Move one unit right (increase x-coordinate).
                break // Exit the switch statement.

            case 270 : // If direction is 270 degrees (South).
                y -= 1 ; // Move one unit down (decrease y-coordinate).
                break // Exit the switch statement.

            case 360 : // If direction is 360 degrees (West).
                x -= 1 // Move one unit left (decrease x-coordinate).
                // Note: No 'break' statement here. As it's the last case,
                // control naturally falls out of the switch.
        }


        // After moving, update the robot's direction by adding 'z'.
        // Since 'z' is 90, this rotates the robot 90 degrees clockwise.
        direction += z ;


        // Check if the robot has returned to its starting position (origin).
        // The origin is defined as when both x and y coordinates are 0.
        if ( x === 0 && y === 0 )
        {
            // If the robot is back at the origin, terminate the simulation loop.
            break
        }

    } // End of the 'while (true)' loop.


    // Once the loop has finished (robot is at origin),
    // output the total number of steps taken to the console.
    console.log( count )

} // End of the 'Main' function definition.


// This line executes the 'Main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as the 'input' argument to the 'Main' function.
Main ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ) ) ;