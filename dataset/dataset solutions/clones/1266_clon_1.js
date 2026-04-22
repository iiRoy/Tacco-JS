/*
 * This JavaScript code implements a solution for drawing checkerboard patterns.
 * It reads height and width values from standard input, then generates
 * and prints a checkerboard of the specified dimensions.
 *
 * This version is a Type I clone, meaning its functionality, structure,
 * and all identifiers (variables, functions, etc.) are identical to the original.
 * The only modifications are extensive changes to whitespace (spaces, tabs, newlines)
 * and the addition/modification of comments, making it visually distinct.
 */


function   Main   (  input  )     {

    //  The input string is first trimmed to remove any leading/trailing whitespace,
    //  then split into an array of strings based on newline characters.
    //  Each element in 'args' represents a separate test case or a line of input.
    const   args   =   input  .  trim  (  )  .  split  (  "\n"  )  ;


    //  Determine the total number of lines (test cases) present in the input.
    let   n   =   args  .  length  ;


    //  Initiate a loop to process each line (test case) individually.
    for    (  let   i   =   0  ;    i   <   n  ;    i  ++  )    {

        //  For the current line, split it by spaces to get individual numbers,
        //  then use 'map' to convert each string part into a numerical value.
        //  'tmp' will store these numerical values, typically height and width.
        let   tmp   =   args  [  i  ]  .  split  (  " "  )  .  map  (  (  x  )    =>    Number  (  x  )  )  ;

        //  Extract the height value from the 'tmp' array (first element).
        let   h   =   tmp  [  0  ]  ;

        //  Extract the width value from the 'tmp' array (second element).
        let   w   =   tmp  [  1  ]  ;


        //  This conditional statement checks for the termination condition.
        //  If both height and width are zero, it signifies the end of input,
        //  and the program should stop processing further test cases.
        if    (    h   ===   0   &&   w   ===   0    )    {
            //  Break out of the loop if the termination condition is met.
            break  ;
        }


        //  Initialize two empty strings, 's' and 't'.
        //  These will be used to construct the two alternating row patterns
        //  required for the checkerboard.
        let   s   =   ""  ;
        let   t   =   ""  ;


        //  This inner loop iterates 'w' (width) times to build the row patterns.
        //  It determines whether a '#' or '.' character should be added to 's' and 't'
        //  based on the column index 'x'.
        for    (  let   x   =   0  ;    x   <   w  ;    x  ++  )    {
            //  If the current column index 'x' is even (0, 2, 4, ...).
            if    (    x   %   2   ===   0    )    {
                //  String 's' gets a hash, 't' gets a dot.
                s   +=   "#"  ;
                t   +=   "."  ;
            }    else    {
                //  If the current column index 'x' is odd (1, 3, 5, ...).
                //  String 's' gets a dot, 't' gets a hash.
                s   +=   "."  ;
                t   +=   "#"  ;
            }
        }


        //  This loop iterates 'h' (height) times to print the complete checkerboard.
        //  It alternates between printing string 's' and string 't' for each row.
        for    (  let   y   =   0  ;    y   <   h  ;    y  ++  )    {
            //  If the current row index 'y' is even.
            if    (    y   %   2   ===   0    )    {
                //  Print the row pattern stored in 's'.
                console  .  log  (  s  )  ;
            }    else    {
                //  If the current row index 'y' is odd.
                //  Print the row pattern stored in 't'.
                console  .  log  (  t  )  ;
            }
        }

        //  After printing each checkerboard pattern, print an empty line.
        //  This serves as a separator between the outputs of different test cases.
        console  .  log  (  )  ;
    }
}


//  This is the entry point for the program execution when run in a Node.js environment.
//  It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
//  The read content is then passed as an argument to the 'Main' function to start processing.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,    "utf8"  )  )  ;