/*
 * This JavaScript program reads three numbers from standard input,
 * performs a series of conditional calculations, and prints the result.
 * It serves as an example of basic input processing and control flow.
 */


//  Importing the 'fs' module, which provides file system functionalities.
//  Specifically, 'readFileSync' is used here to synchronously read the entire content of a file.
const   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


//  The input string is expected to contain space-separated numbers.
//  This line splits the input string into an array of strings based on the space delimiter.
const   list   =   input   .   split   (   ' '   )   ;


//  The first element of the 'list' array is converted to a number and assigned to the constant 'k'.
const   k   =   Number   (   list   [   0   ]   )   ;


//  The second element of the 'list' array is converted to a number and assigned to the constant 'a'.
const   a   =   Number   (   list   [   1   ]   )   ;


//  The third element of the 'list' array is converted to a number and assigned to the constant 'b'.
const   b   =   Number   (   list   [   2   ]   )   ;


//  Defining an arrow function named 'output' that encapsulates the core logic of the program.
const   output   =   (   )   =>   {
    //  First conditional check: If 'k' is strictly less than 'a' plus one.
    if   (   k   <   a   +   1   )   {
        //  If the condition is true, print 'k' plus one to the console.
        console   .   log   (   k   +   1   )   ;
    }   else   if   (   b   <=   a   +   2   )   {
        //  Second conditional check (executed if the first is false):
        //  If 'b' is less than or equal to 'a' plus two.
        console   .   log   (   k   +   1   )   ;   //  Again, print 'k' plus one.
    }   else   if   (   (   k   -   a   +   1   )   %   2   ===   0   )   {
        //  Third conditional check (executed if the first two are false):
        //  If the result of (k - a + 1) is an even number (i.e., its remainder when divided by 2 is 0).
        console   .   log   (   a   +   (   b   -   a   )   *   (   k   -   a   +   1   )   /   2   )   ;
    }   else   {
        //  Default case: If none of the preceding conditions are met.
        //  Perform a different calculation and print the result.
        console   .   log   (   a   +   (   b   -   a   )   *   (   k   -   a   )   /   2   +   1   )   ;
    }
}   ;


//  Execute the 'output' function to run the main logic and produce the final result.
output   (   )   ;