function   part1  ( a , b , c )   {
    // This function calculates a count based on specific decrementing rules.
    // It's one of the three strategies to maximize the total count.
    /*
     *  Initializes a counter 'cnt' to zero.
     *  Enters an infinite loop that continues until no more decrements can be made.
     */
    var    cnt    =    0   ;

    while   ( true )    { // The main processing loop for this part.
        // Store the current count to detect if any operations were performed in this iteration.
        var   flag    =   cnt   ;


        if  (  a >= 1  &&  b >= 1  &&  c >= 1  )  {  // Check for the first condition: all three variables are at least 1.
            a--  ; /* Decrement 'a' */
            b--  ; /* Decrement 'b' */
            c--  ; /* Decrement 'c' */
            cnt++  ; // Increment the total count for this successful operation.
        }

        // Separate conditions for decrementing by 3
        if  (  a >= 3  )  {  // If 'a' is at least 3, perform a larger decrement.
            a -= 3  ;
            cnt++  ; // Increment count.
        }

        if  (  b >= 3  )  {  // If 'b' is at least 3, perform a larger decrement.
            b -= 3  ;
            cnt++  ; // Increment count.
        }

        if  (  c >= 3  )  {  // If 'c' is at least 3, perform a larger decrement.
            c -= 3  ;
            cnt++  ; // Increment count.
        }


        // If 'flag' is still equal to 'cnt', it means no operations occurred in this iteration.
        // Therefore, we can break out of the infinite loop.
        if  (  flag == cnt  )  {  break  ;  }
    }

    // Return the final calculated count for this strategy.
    return   cnt   ;
}


function   part2  ( a , b , c )   {
    // This is the second strategy function, very similar to part1 but with a slight variation in operation order.
    var    cnt    =    0   ; /* Initialize counter to zero */

    while   ( true )    { /* Keep looping indefinitely */

        var   flag    =   cnt   ; // Snapshot the current count before potential changes.

        // First set of decrements by 1 for all three variables.
        if  (  a >= 1  &&  b >= 1  &&  c >= 1  )  {
            a--  ;
            b--  ;
            c--  ;
            cnt++  ;
        }

        // This strategy specifically includes a duplicate check for the a,b,c >= 1 condition.
        // This might lead to different results or just be a specific rule.
        if  (  a >= 1  &&  b >= 1  &&  c >= 1  )  {
            a--  ; // Decrement 'a'
            b--  ; // Decrement 'b'
            c--  ; // Decrement 'c'
            cnt++  ; // Increment the counter.
        }

        // Now, check for decrements by 3 for each variable individually.
        if  (  a >= 3  )  {
            a -= 3  ; // Subtract 3 from 'a'.
            cnt++  ; // Increment count.
        }

        if  (  b >= 3  )  {
            b -= 3  ; // Subtract 3 from 'b'.
            cnt++  ; // Increment count.
        }

        if  (  c >= 3  )  {
            c -= 3  ; // Subtract 3 from 'c'.
            cnt++  ; // Increment count.
        }

        // If no changes were made in this pass, exit the loop.
        if  (  flag == cnt  )  {  break  ;  }
    }

    // Final count for strategy 2.
    return   cnt   ;
}


function   part3  ( a , b , c )   {
    // The third strategy function. Order of operations is different again.
    var    cnt    =    0   ; // Our trusty counter, starting at nothing.

    while   ( true )    { // Yet another infinite loop, standard practice here.

        var   flag    =   cnt   ; // Capture the state for loop termination check.

        // In this strategy, the 'decrement by 3' operations come first.
        if  (  a >= 3  )  {
            a -= 3  ; // 'a' reduced by 3.
            cnt++  ; // Count increases.
        }

        if  (  b >= 3  )  {
            b -= 3  ; // 'b' reduced by 3.
            cnt++  ; // Count increases.
        }

        if  (  c >= 3  )  {
            c -= 3  ; // 'c' reduced by 3.
            cnt++  ; // Count increases.
        }

        // After checking for decrements by 3, we check for decrements by 1 for all three.
        if  (  a >= 1  &&  b >= 1  &&  c >= 1  )  {
            a--  ; // Decrement 'a'.
            b--  ; // Decrement 'b'.
            c--  ; // Decrement 'c'.
            cnt++  ; // Increment the counter.
        }

        // If the count didn't change in this iteration, we're done.
        if  (  flag == cnt  )  {  break  ;  }
    }

    // Return the total operations performed by this strategy.
    return   cnt   ;
}


// Main program execution starts here.
// It reads input, processes it, and prints results.

var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ; // Read all input from standard input as a UTF-8 string.

// Process the input string: remove leading/trailing whitespace, then split by newline characters.
var   arr   =   input . trim ( ) . split ( "\n" )   ;

while   ( true )    { // Main processing loop for input lines.

    // Get the next line from the array. The 'shift()' method removes the first element.
    var   str   =   arr . shift ( )   ;

    // Check for the termination condition: "0 0 0 0 0 0" indicates end of input.
    if  (  str == "0 0 0 0 0 0"  )  {  break  ;  }

    // Split the current line by spaces and convert each part to a number.
    var   ary   =   str . split ( " " ) . map ( Number )   ;

    // Combine values from the input array to form 'a', 'b', and 'c'.
    var   a   =   ary [ 0 ]   +   ary [ 3 ]   ; // Sum of first and fourth elements.
    var   b   =   ary [ 1 ]   +   ary [ 4 ]   ; // Sum of second and fifth elements.
    var   c   =   ary [ 2 ]   +   ary [ 5 ]   ; // Sum of third and sixth elements.

    var   cnt   =   0   ; // Initialize the total count for the current input set.

    // Calculate initial contributions from 'a', 'b', 'c' based on division by 3.
    // This effectively extracts the 'groups of 3' that can be formed directly.
    var   A   =   ( a - ( a % 3 ) )   /   3   ; // Integer division for 'a' by 3.
    var   B   =   ( b - ( b % 3 ) )   /   3   ; // Integer division for 'b' by 3.
    var   C   =   ( c - ( c % 3 ) )   /   3   ; // Integer division for 'c' by 3.

    // Adjust 'a', 'b', 'c' and add to count if initial 'A', 'B', 'C' are at least 1.
    // This effectively normalizes the values to be processed by part1/2/3 functions.
    if  (  A >= 1  )  {
        A--  ; // Decrement A, as one group of 3 is handled differently.
        a   =   a % 3   +   3   ; // Re-adjust 'a' to be its remainder + 3.
    }

    if  (  B >= 1  )  {
        B--  ; // Decrement B.
        b   =   b % 3   +   3   ; // Re-adjust 'b' to be its remainder + 3.
    }

    if  (  C >= 1  )  {
        C--  ; // Decrement C.
        c   =   c % 3   +   3   ; // Re-adjust 'c' to be its remainder + 3.
    }

    // Add the initial 'A', 'B', 'C' contributions to the total count.
    cnt   +=   A   +   B   +   C   ;

    // Calculate the maximum possible count from the three different strategies
    // using the adjusted 'a', 'b', 'c' values.
    cnt   +=   Math . max ( part1 ( a , b , c ) , part2 ( a , b , c ) , part3 ( a , b , c ) )   ;

    // Output the final calculated count for the current input line.
    console . log ( cnt )   ;
}

// End of script. Hopefully, this clone is sufficiently different visually!