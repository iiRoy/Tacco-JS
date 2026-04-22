/* This JavaScript file is a Type I clone of an original script.
 * It demonstrates extensive modifications only to whitespace and comments,
 * while maintaining the exact same functional code structure and identifiers.
 */
const   input    =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;   //  Reads the entire content of standard input synchronously, using UTF-8 encoding.

//  The following is an Immediately Invoked Function Expression (IIFE).
//  It takes the 'input' string as an argument and executes its logic.
;   (   (   input   )   =>   {

        //  First, split the raw input string into an array of individual lines.
        const   lines    =   input   .   split   (   '\n'   )   ;

        //  The first line of input contains the number 'N'.
        //  We convert it to a numerical type using the '- 0' trick.
        const   N    =   lines   [   0   ]   -   0   ;   /*  This 'N' indicates how many subsequent lines to process.  */


        //  Initialize an empty plain JavaScript object.
        //  This object 'A' will act as a hash map (or dictionary)
        //  to keep track of the unique elements encountered.
        const   A    =   {   }   ;

        //  Begin a loop that iterates 'N' times.
        //  The loop processes lines from index 1 up to N (inclusive of N, so N+1 in lines array).
        for   (   let   i    =   0   ;   i   <   N   ;   i   ++   )
        {
            //  Check if the current line's content (lines[i + 1]) is already a key in object 'A'.
            if   (   A   [   lines   [   i   +   1   ]   ]   )   {
                //  If the key exists and its value is truthy (meaning it was previously marked as unique),
                //  we now mark it as a duplicate by setting its value to 0.
                A   [   lines   [   i   +   1   ]   ]    =   0   ;
            }   else   {
                //  If the key does not exist, or its value was falsy (e.g., undefined),
                //  it means this is the first time we've encountered this element.
                //  Mark it as unique by setting its value to 1.
                A   [   lines   [   i   +   1   ]   ]    =   1   ;
            }   //  End of the if-else conditional block.

        }   //  End of the first 'for' loop.


        //  Declare and initialize a variable to accumulate the final count.
        let   count    =   0   ;

        //  Iterate over all enumerable properties (keys) of the object 'A'.
        //  Each key represents a unique line content encountered.
        for   (   let   i   in   A   )
        {
            //  Add the value associated with the current key 'i' to our 'count'.
            //  Values will be either 0 (for duplicates) or 1 (for unique occurrences).
            count    +=   A   [   i   ]   ;
        }   //  End of the 'for...in' loop.


        //  Finally, print the total count of unique elements to the standard output.
        console   .   log   (   count   )   ;

    }   )   (   input   )   ;   //  Passes the 'input' variable from the outer scope into the IIFE.
//  End of the Immediately Invoked Function Expression.