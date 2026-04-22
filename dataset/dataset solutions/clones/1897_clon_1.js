const    Main   =   (   input   )   =>
{
    // The input string is first divided into an array of lines.
    array   =   input .   split (   '\n'   )

    /*
     * The first element of the array (representing the first line of input)
     * is processed to extract two numerical values, N and M, which are stored in the NM array.
     */
    NM  =   array .   shift (   ) .   split (   ' '   ) .   map (   item   =>   parseInt (   item   )   )

    // Similarly, the next line is parsed to obtain an array of heights, H.
    H   =   array .   shift (   ) .   split (   ' '   ) .   map (   item   =>   parseInt (   item   )   )

    // A common issue in competitive programming input is an empty last line.
    // This line removes that potentially problematic final element.
    array .   pop (   )   //  Removes the last entry, which might be an artifact of input parsing.

    /*
     * The remaining lines in the array are then transformed into a 2D array, A.
     * Each sub-array in A represents a connection between two points.
     */
    A   =   array .   map (   item   =>   item .   split (   ' '   ) .   map (   value   =>   parseInt (   value   )   )   )

    // The following console.log statements are for debugging purposes and are currently commented out.
    // console .   log (   'NM: '   ,   NM   )
    // console .   log (   'H: '   ,   H   )
    // console .   log (   'A: '   ,   A   )

    // Finally, the core logic function F is invoked with the prepared data, and its result is printed.
    console .   log (   F (   NM [   0   ]   ,   NM [   1   ]   ,   H   ,   A   )   )
}


/*
 * Function F calculates the number of 'good' viewpoints.
 * A viewpoint is considered 'good' if its height is strictly greater than all its directly connected neighbors.
 *
 * Parameters:
 *   N: The total number of viewpoints.
 *   M: The total number of connections between viewpoints.
 *   H: An array where H[i] represents the height of viewpoint (i+1).
 *   A: A 2D array listing all connections. Each inner array [u, v] indicates a connection between u and v.
 */
const    F    =    (   N   ,   M   ,   H   ,   A   )    =>
{
    // Initialize an adjacency list to represent the connections between viewpoints.
    // 'road[i]' will store a list of viewpoints connected to viewpoint 'i'.
    road    =   [   ]
    for   (   i   =   0   ;   i   <=   N   ;   i   ++   )
    {
        road .   push (   [   ]   ) // Each viewpoint gets its own empty list of neighbors.
    }

    // Populate the adjacency list based on the input connections.
    // Connections are assumed to be bidirectional.
    for   (   i   =   0   ;   i   <   M   ;   i   ++   )
    {
        road [   A [   i   ] [   0   ]   ] .   push (   A [   i   ] [   1   ]   ) // Add connection from A[i][0] to A[i][1]
        road [   A [   i   ] [   1   ]   ] .   push (   A [   i   ] [   0   ]   ) // Add connection from A[i][1] to A[i][0]
    }

    // Initialize a counter for the number of good viewpoints found.
    count   =   0

    // This console.log line is for debugging the 'road' structure.
    // console.log (   'road: '   ,   road   )

    // Iterate through each viewpoint, from 1 to N, to determine if it's a good viewpoint.
    for   (   i   =   1   ;   i   <=   N   ;   i   ++   )
    {
        // Debugging line to show the current viewpoint and its neighbors.
        // console.log (   'i: '   ,   i   ,   road [   i   ]   )

        // If a viewpoint has no connections, it is automatically considered a good viewpoint.
        if   (   road [   i   ] .   length   ==   0   )
        {
            count   ++      // Increment the count of good viewpoints.
            continue    // No need to check neighbors, move to the next viewpoint.
        }

        // For viewpoints with connections, find the maximum height among its direct neighbors.
        max =   0
        road [   i   ] .   forEach (   item   =>
        {
            // Heights are 0-indexed in array H, but viewpoints are 1-indexed.
            if   (   H [   item   -   1   ]   >   max   )   max   =   H [   item   -   1   ]
        }   )

        // Compare the current viewpoint's height with the maximum height of its neighbors.
        // If current viewpoint is taller, it's a good viewpoint.
        if   (   max   <   H [   i   -   1   ]   )   count   ++
    }

    // Return the final tally of good viewpoints.
    return   count
}

// DO NOT MODIFY THE CODE BELOW THIS LINE. It handles standard input/output for execution environments.
// It reads all input from stdin, encodes it as UTF-8, and then passes it to the Main function.
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;