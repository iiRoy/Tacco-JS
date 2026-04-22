function        Main    (   input   )
{
    // First, the input string is broken down into an array of lines.
    // Each line is separated by a newline character.
    input   =   input . split   (   "\n"    )   ;

    // The first line of the input array is further split by spaces.
    // This line is expected to contain two values: N and K.
    inp     =   input   [   0   ]   .   split   (   " " )   ;

    // The second line of the input array is also split by spaces.
    // This line is expected to contain an array of numbers (or strings representing numbers).
    inA     =   input   [   1   ]   .   split   (   " " )   ;

    // Extract N and K from the 'inp' array.
    N       =   inp     [   0   ]   ; // N is the first element.
    K       =   inp     [   1   ]   ; // K is the second element.

    // Initialize several variables that will be used in the subsequent calculations.
    answer  =   0   ;   // This variable will store the final result.
    index   =   0   ;   // This will hold the index of the first occurrence of "1" in 'inA'.
    len     =   inA . length    ;   // 'len' stores the total number of elements in the 'inA' array.
    a       =   1   ;   // 'a' is a temporary variable, re-assigned later.
    b       =   1   ;   // 'b' is another temporary variable, re-assigned later.
    c       =   0   ;   // 'c' is a conditional flag, potentially becoming -1.

    // This loop iterates through the 'inA' array from the beginning.
    // Its purpose is to locate the first instance where an element is equal to the string "1".
    for (   i   =   0   ;   i   <   len ;   i   ++  )
    {
        // If the current element of 'inA' is found to be "1"...
        if  (   inA [ i ]   ==  "1"   )
        {
            index   =   i   ;   // ...its index is stored in the 'index' variable.
            break   ;           // The loop is then immediately terminated.
        }
    }

    // 'a' is set to the 'index' found above. This represents the distance from the start to "1".
    a   =   index   ;
    // 'b' is calculated as the distance from "1" to the end of the array.
    b   =   len     -   1   -   index   ;

    // Check a specific condition involving 'a', 'b', and 'K'.
    // If the sum of 'a' and 'b' is less than or equal to 'K', 'c' is set to -1.
    if  (   a   +   b   <=  K   )
    {
        c   =   -1  ;
    }

    // This loop processes the 'a' variable.
    // It continues as long as 'a' remains greater than 0.
    for (   ;   a   >   0   ;   )
    {
        answer  =   answer  +   1   ;   // Increment the 'answer' for each iteration.
        a       =   a       -   (   K   -   1   )   ;   // Decrement 'a' by (K - 1).
    }

    // This loop processes the 'b' variable.
    // It continues as long as 'b' remains greater than 0.
    for (   ;   b   >   0   ;   )
    {
        answer  =   answer  +   1   ;   // Increment the 'answer' for each iteration.
        b       =   b       -   (   K   -   1   )   ;   // Decrement 'b' by (K - 1).
    }

    // Final adjustment to the 'answer' based on the value of 'c'.
    // This step is only performed if 'answer' is not zero.
    if  (   answer  !=  0   )
    {
        answer  =   answer  +   c   ;   // Add 'c' to 'answer'.
    }

    // The final calculated 'answer' is printed to the console.
    console . log   (   answer  )   ;
}

// This line executes the 'Main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as the 'input' argument to the 'Main' function.
Main    (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;