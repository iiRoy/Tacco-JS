/* This function is a simple wrapper for console.log */
function    myout   (   text   )   {   console.log   (   text   )   ;   }   //  Outputs the provided text to the standard console.

/**
 * Main entry point for the program.
 * Processes the input string to solve a specific problem.
 * @param {string} input - The raw input string from stdin.
 */
function Main(input)
{
    // The following lines are commented out as they represent alternative input parsing strategies.
    // input = parseInt(input);
    // input = input.trim().split(" ");

    // The chosen input parsing method: trim whitespace and split by newline characters.
    input = input.trim().split("\n");

    // Other commented out parsing options, converting to numbers after splitting.
    // input = input.trim().split(" ").map((a)=>Number(a));
    // input = input.trim().split("\n").map((a)=>Number(a));


    // Extract N from the first line of input. N represents the length of the string 's'.
    var N       =   parseInt(   input[0]   )   ;

    // Extract the string 's' from the second line of input.
    var s       =   input[1]   ;

    // Initialize a counter for 'W' characters encountered from the start.
    var wCount  =   0   ;

    // A list to store the cumulative count of 'W's up to each index.
    var wList   =   [   ]   ;

    // Initialize a counter for 'E' characters encountered from the end (or total count).
    var eCount  =   0   ;

    // A list to store the cumulative count of 'E's from each index to the end.
    var eList   =   [   ]   ;

    // Initialize the output variable with a very large value for finding the minimum.
    var output  =   1000000   ;


    // First pass: Calculate cumulative 'W' counts and total 'E' count.
    for  (   var   i   =   0   ;   i   <   N   ;   i++   )
    {
        // Extract a single character at the current index.
        var   tmp   =   s.slice   (   i   ,   i   +   1   )   ;

        // If the character is 'W', increment the 'W' counter.
        if   (   tmp   ==   "W"   )
        {
            wCount++   ;
        }
        else   // Otherwise, it must be 'E', so increment the 'E' counter.
        {
            eCount++   ;
        }

        // Store the current cumulative 'W' count in the list.
        wList.push   (   wCount   )   ;
    }


    // Second pass: Calculate cumulative 'E' counts from right to left (effectively).
    // This loop starts with the total 'E' count and decrements as it moves left.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )
    {
        // Extract the character at the current index.
        var   tmp   =   s.slice   (   i   ,   i   +   1   )   ;

        // If the character is 'E', decrement the 'E' counter.
        // This simulates the count of 'E's to the *right* of the current position.
        if   (   tmp   ==   "E"   )
        {
            eCount--   ;
        }

        // Store the current 'E' count (representing 'E's to the right of 'i' if i was the meeting point).
        eList.push   (   eCount   )   ;
    }


    // Third pass: Determine the minimum number of turns.
    // Iterates through each possible meeting point.
    for   (   var   i   =   0   ;   i   <   N   ;   i++   )
    {
        // Get the character at the current index.
        var   tmp   =   s.slice   (   i   ,   i   +   1   )   ;

        // If the character at the meeting point is 'W',
        // it means this 'W' was counted in wList[i] but doesn't need to turn.
        // So, we decrement wList[i] to exclude the current 'W' from the turns needed for 'W's.
        if   (   tmp   ==   "W"   )
        {
            wList[i]--   ;
        }

        // Calculate the total turns needed if 'i' is the meeting point:
        // (number of 'W's to the left that need to turn 'E') + (number of 'E's to the right that need to turn 'W').
        // Update the minimum output if the current turns are fewer.
        output   =   Math.min   (   output   ,   wList[i]   +   eList[i]   )   ;
    }


    // Output the final calculated minimum number of turns.
    myout   (   output   )   ;
}

// This section reads input from standard input, processes it, and calls the Main function.
// It uses Node.js 'fs' module to read the file.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .trim   (   )   )   ;