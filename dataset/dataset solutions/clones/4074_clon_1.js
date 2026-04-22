/*
 *  Problem: ABC 086 - Traveling
 *
 *  This JavaScript program analyzes a series of travel plans
 *  to determine if a person can reach specified coordinates
 *  at given times, starting from the origin (0,0) at time 0.
 */

// The 'input' parameter will contain the entire input data as a single string.
function Main (    input    )
{
    // Split the input string by newline characters to get an array of lines.
    var    arr    =    input.split (    "\n"    ) ;

    // Initialize current coordinates and result status.
    var    x                =    0    ;       // Current x-coordinate, starting at 0.
    var    y                =    0    ;       // Current y-coordinate, starting at 0.
    var    result           =    "Yes" ;    // Overall feasibility result, initially optimistic.
    var    before_tmp       =    0    ;       // Time of the previous stop, initialized to 0.


    // Iterate through each travel plan entry, skipping the first line (which typically contains N).
    for (    var    i    =    1    ;    i    <    arr.length    ;    i    ++    )
    {
        // Split the current line into components: target time, target x, target y.
        var    tmp        =    arr[i].split (    " "    ) ;

        // Parse the total time elapsed from the beginning of the journey to reach this point.
        var    N          =    parseInt (    tmp[0]    ,    10    ) ; // Total time (seconds) from start.

        // Calculate the absolute difference in x-coordinates from the current position to the target.
        var    x_range    =    check (    x    ,    parseInt (    tmp[1]    ,    10    )    ) ;

        // Calculate the absolute difference in y-coordinates from the current position to the target.
        var    y_range    =    check (    y    ,    parseInt (    tmp[2]    ,    10    )    ) ;

        // Adjust N to represent the time duration for the *current* travel segment.
        N    -=    before_tmp    ; // Time allowed for this specific move.


        // Evaluate the feasibility of the current travel segment.

        // Condition 1: If the sum of required distance (Manhattan distance) is less than the available time,
        // it means the destination is reached early.
        if    (    x_range    +    y_range    <    N    )
        {
            // If the remaining time (N - (x_range + y_range)) is an odd number,
            // it's impossible to spend the excess time by moving back and forth,
            // as each move changes parity.
            if    (    parseInt (    N    -    (    x_range    +    y_range    )    ,    10    )    %    2    !=    0    )
                result    =    "No"    ; // The plan is not feasible.
        }
        // Condition 2: If the sum of required distance is greater than the available time,
        // it means there isn't enough time to reach the destination.
        // (Note: Per original code logic, this condition sets result to "Yes".)
        else    if    (    x_range    +    y_range    >    N    )
        {
            result    =    "No"    ; // The plan is not feasible.
        }


        // Update the current x and y coordinates to the target coordinates for the next iteration.
        x    =    tmp[1]    ;
        y    =    tmp[2]    ;

        // Update the 'before_tmp' with the current segment's allowed time 'N' for the next iteration.
        before_tmp    =    N    ;
    }

    // Print the final result to the console.
    console.log (    result    ) ;
}


// Helper function: Calculates the absolute difference between two coordinate values.
// This is equivalent to Manhattan distance in one dimension.
function    check (    before    ,    after    )
{
    // If 'after' coordinate is greater than 'before', calculate the positive difference.
    if    (    before    <    after    )
    {
        return    after    -    before    ;
    }
    else    // Otherwise, 'before' is greater than or equal to 'after', calculate the positive difference.
    {
        return    before    -    after    ;
    }
} ;


// Read input from standard input and pass it to the Main function for processing.
Main (    require (    "fs"    )    .    readFileSync (    "/dev/stdin"    ,    "utf8"    )    ) ;