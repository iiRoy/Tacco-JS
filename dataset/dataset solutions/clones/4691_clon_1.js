function   Main  (  num  )   {
    // This function calculates a specific financial outcome based on an input 'num'.

    // First, we determine the 'paid' amount by multiplying the input number by 800.
    var   paid   =   num   *   800   ;

    // Next, we initialize a counter variable to keep track of iterations.
    var   counter   =   0   ;

    // We then enter a loop that continues as long as 'num' is non-negative.
    // In each iteration, 'num' is decremented by 15, and the 'counter' is incremented.
    for   (   num   ;   num   >=   0   ;   num   -=   15   )   {
        // Increment the counter for every cycle of the loop.
        counter   +=   1
    }

    // After the loop concludes, we calculate the 'returned' amount.
    // This is derived from the final 'counter' value, multiplied by 200, plus an additional 200.
    var   returned   =   (   counter   *   200   )   +   200   ;

    // Finally, the difference between the 'paid' and 'returned' amounts is logged to the console.
    console   .   log   (   paid   -   returned   )   ;

}

// The Main function is invoked here.
// It reads its numerical input from standard input,
// using the 'fs' module to synchronously read the file content as a UTF-8 string.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;