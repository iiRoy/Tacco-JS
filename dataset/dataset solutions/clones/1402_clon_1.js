/*
 * This JavaScript program reads input from stdin, processes it,
 * and then prints the result to stdout.
 *
 * It specifically reads a multi-line input, extracts the second line,
 * parses space-separated numbers from it, sorts them numerically,
 * and finally prints the sorted numbers separated by spaces.
 */

//  Declare a variable to hold the input content from standard input.
var     input     =     require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   ) ;


//  The input content is trimmed for any leading/trailing whitespace,
//  and then split into an array of strings based on newline characters.
var     arr     =     input .   trim (   ) .   split (   "\n"   ) ;


//  Access the second line (index 1) from the 'arr' array.
//  This line is then split by spaces, and each part is converted to a Number.
//  Finally, the array of numbers is sorted in ascending order using a custom comparison function.
var     ary     =     arr [   1   ] .   split (   " "   ) .   map (   Number   ) .   sort (   function (   a   ,   b   )   {
        //  The comparison function for numeric ascending sort.
        return     a   -   b   ;
    }   ) ;


//  The sorted array of numbers ('ary') is joined back into a single string
//  with spaces as delimiters, and then printed to the console (standard output).
console .   log (   ary .   join (   " "   )   ) ;