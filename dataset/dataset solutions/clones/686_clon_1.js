/*
 * This JavaScript file processes robot movement commands for multiple test cases.
 * It reads input from standard input, simulates movements within a defined grid,
 * and outputs the robot's final position (x, y coordinates).
 *
 * Each test case begins with grid dimensions (width and height), followed by
 * a series of movement commands. The processing for a test case concludes
 * with a "STOP" command. The entire program terminates when "0 0" is read
 * as grid dimensions.
 */
var    input    = require   (  'fs'  )  .  readFileSync  (   '/dev/stdin'   ,    'utf8'   )   ;

var    arr    =    input    .    trim    (    )    .    split    (    "\n"    )    ;

// Begin the main processing loop. This loop iterates through each test case.
// It continues until a specific termination condition is met.
while    (    true    )    {

    var    wh    =    arr    .    shift    (    )    ;

    // Check for the global termination condition: "0 0" indicates end of input.
    if    (    wh    ==    "0 0"    )    break    ;

    // Parse the grid dimensions (width and height) for the current test case.
    // The input line "wh" is split by space and converted to numbers.
    wh    =    wh    .    split    (    " "    )    .    map    (    Number    )    ;

    var    w    =    wh    [    0    ]    ;    // 'w' represents the width of the grid.
    var    h    =    wh    [    1    ]    ;    // 'h' represents the height of the grid.

    // Initialize the robot's state array 'xy'.
    // xy[0]: Direction (0=Up, 1=Right, 2=Down, 3=Left)
    // xy[1]: Current X-coordinate (1-indexed)
    // xy[2]: Current Y-coordinate (1-indexed)
    var    xy    =    [    0    ,    1    ,    1    ]    ;

    // This inner loop processes individual commands for the current robot simulation.
    // It runs until a "STOP" command is encountered.
    while    (    true    )    {

        var    ary    =    arr    .    shift    (    )    .    split    (    " "    )    ;

        // If the command has a second argument, ensure it's converted to a number.
        // This is typically for movement steps.
        if    (    ary    .    length    ==    2    )    {
            ary    [    1    ]    =    ary    [    1    ]    -    0    ;
        }

        // Check for the command-sequence termination condition "STOP".
        // This breaks out of the inner loop, signaling the end of commands for this grid.
        if    (    ary    [    0    ]    ==    "STOP"    )    break    ;

        // Handle the "RIGHT" turn command.
        // Increments the direction, wrapping around from 3 to 0.
        if    (    ary    [    0    ]    ==    "RIGHT"    )    {
            xy    [    0    ]    ++    ;
            if    (    xy    [    0    ]    ==    4    )    {
                xy    [    0    ]    =    0    ;
            }
        }

        // Handle the "LEFT" turn command.
        // Decrements the direction, wrapping around from 0 to 3.
        if    (    ary    [    0    ]    ==    "LEFT"    )    {
            xy    [    0    ]    --    ;
            if    (    xy    [    0    ]    ==    -1    )    {
                xy    [    0    ]    =    3    ;
            }
        }

        // Handle the "FORWARD" movement command.
        // The robot moves forward 'ary[1]' steps in its current direction.
        if    (    ary    [    0    ]    ==    "FORWARD"    )    {
            while    (    ary    [    1    ]    --    )    {
                if    (    xy    [    0    ]    ==    0    )    xy    [    2    ]    ++    ;    // Facing Up: Increase Y
                if    (    xy    [    0    ]    ==    1    )    xy    [    1    ]    ++    ;    // Facing Right: Increase X
                if    (    xy    [    0    ]    ==    2    )    xy    [    2    ]    --    ;    // Facing Down: Decrease Y
                if    (    xy    [    0    ]    ==    3    )    xy    [    2    ]    --    ;    // Facing Left: Decrease Y (as per original logic)
            }
        }

        // Handle the "BACKWARD" movement command.
        // The robot moves backward 'ary[1]' steps against its current direction.
        if    (    ary    [    0    ]    ==    "BACKWARD"    )    {
            while    (    ary    [    1    ]    --    )    {
                if    (    xy    [    0    ]    ==    0    )    xy    [    2    ]    --    ;    // Facing Up: Decrease Y
                if    (    xy    [    0    ]    ==    1    )    xy    [    1    ]    --    ;    // Facing Right: Decrease X
                if    (    xy    [    0    ]    ==    2    )    xy    [    2    ]    ++    ;    // Facing Down: Increase Y
                if    (    xy    [    0    ]    ==    3    )    xy    [    1    ]    ++    ;    // Facing Left: Increase X (as per original logic)
            }
        }

        // Apply boundary conditions to ensure the robot stays within the grid.
        // If the robot moves beyond the grid boundaries, its position is clamped.
        if    (    xy    [    1    ]    <    1    )    xy    [    1    ]    =    1    ;    // Clamp X to minimum 1
        if    (    xy    [    2    ]    <    1    )    xy    [    2    ]    =    1    ;    // Clamp Y to minimum 1
        if    (    xy    [    1    ]    >    w    )    xy    [    1    ]    =    w    ;    // Clamp X to maximum width 'w'
        if    (    xy    [    2    ]    >    h    )    xy    [    2    ]    =    h    ;    // Clamp Y to maximum height 'h'

    } // End of the inner loop for command processing.

    // After all commands for a test case are processed, remove the direction component.
    // Only the X and Y coordinates are needed for the output.
    xy    .    shift    (    )    ;

    // Output the final X and Y coordinates, separated by a single space.
    console    .    log    (    xy    .    join    (    " "    )    )    ;

} // End of the main loop for test cases.