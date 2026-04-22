/* This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally equivalent version.
 */


    var     input     =     require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


//  The input string is first trimmed of leading/trailing whitespace,
//  then split into an array of lines based on newline characters.
    var     Arr     =     (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;


/*
 * The very first element of the processed array (Arr[0])
 * is assigned to the variable 'a'. This 'a' will be the
 * substring we are looking for in subsequent lines.
 */
    var     a     =     Arr   [   0   ]   ;


//  A counter variable 'ctn' is initialized to zero.
//  This variable will store the total count of occurrences.
    var     ctn     =     0     ;


//  A loop iterates through the array 'Arr', starting from the second element (index 1).
//  The first element (index 0) is skipped as it contains the substring 'a' itself.
    for   (   i   =   1   ;   i   <   Arr   .   length   ;   i   ++   )
    {
        //  Inside the loop, each line is checked.
        //  If a line exactly matches "END_OF_TEXT", the loop terminates prematurely.
        if   (   Arr   [   i   ]   ===   "END_OF_TEXT"   )
        {
            break   ;
        }

        /*
         * For each valid line (not "END_OF_TEXT"),
         * we split the current line (Arr[i]) by the substring 'a'.
         * The number of resulting parts minus one gives us the
         * number of times 'a' appeared in that line.
         * This count is stored in 'num'.
         */
        var     num     =     (   (   Arr   [   i   ]   )   .   split   (   a   )   )   .   length   -   1   ;


        //  The 'num' (occurrences in the current line) is added to the total counter 'ctn'.
        ctn     +=     num     ;
    }


//  Finally, after processing all relevant lines,
//  the accumulated total count stored in 'ctn' is printed to the console.
    console   .   log   (   ctn   )   ;