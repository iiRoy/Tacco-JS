/*
 *  This JavaScript function, named 'Main', serves as the entry point for processing input data.
 *  The entire content of the input is provided as a single string argument to this function.
 */
function   Main (   input   )
{
    // The initial 'input' string is parsed by splitting it into an array of strings
    // based on newline characters.
    // Consequently, each line from the original input becomes an individual element
    // within the 'input' array (e.g., input[0] is the first line, input[1] is the second, etc.).
    input  =  input . split ( "\n" ) ;

    // The following line is a commented-out example of an alternative input parsing approach,
    // which was not ultimately used in the final logic.
    // input1 = input.split('').map((n) => (parseInt(n)))

    /*
     *  A new array, 'arr', is initialized here.
     *  It's derived from the 'input' array through a two-step process:
     *  1.  Each string element in 'input' is converted to an integer using parseInt().
     *  2.  The first element of the resulting array (at index 0) is then filtered out,
     *      meaning the first line of the original input is intentionally excluded from 'arr'.
     */
    var   arr   =   input
        . map (   (   n   )   =>   parseInt (   n   )   )
        . filter (   (   n   ,   i   )   =>   (   i   !=   0   )   ) ;

    // This line is another commented-out alternative for initializing 'arr',
    // which would have included all parsed integers without filtering the first.
    // var arr = input.map((n) => parseInt(n))

    // A variable named 'ans' is declared and initialized to the integer value 0.
    // While declared, 'ans' is not actively used or modified within the current logic
    // to produce the final output.
    var   ans   =   0   ;

    /*
     *  The code now iterates through each element of the 'arr' array.
     *  For every element 'n' at a specific index 'i':
     *  It computes the maximum value among all *other* elements in 'arr'
     *  (i.e., excluding the element at the current index 'i' itself).
     *  This calculated maximum value is then immediately printed to the console.
     */
    arr . forEach (   (   n   ,   i   )   =>
    {
        // This is a commented-out line that shows an alternative, but unused, approach
        // for finding the maximum value within a filtered subset of 'arr'.
        // console.log(Math.max(arr.filter((num, s) => (s != i))))

        // The following statement performs the core logic:
        // 1.  It filters 'arr' to create a new temporary array containing all elements
        //     except the one at the current index 'i'.
        // 2.  It then uses the 'reduce' method on this temporary array to find the maximum
        //     value among its elements.
        // 3.  Finally, this maximum value is output to the standard console.
        console . log (
            arr . filter (   (   num   ,   index   )   =>   (   index   !=   i   )   )
                . reduce (   (   nn   ,   ii   )   =>   (   Math . max (   nn   ,   ii   )   )   )
        ) ;
    }   ) ;


    // This section is designated for output operations.
    // The variable 'ans', though initialized, is not utilized for any console output
    // in the currently active code.
    // console.log(ans )

} /* End of the 'Main' function definition */


/*
 *  ***** IMPORTANT: PLEASE DO NOT EDIT THE LINES BELOW THIS COMMENT BLOCK. *****
 *  These lines are crucial for handling the standard input/output mechanism.
 *  They are responsible for reading the entire input content at once from a file
 *  and subsequently invoking the 'Main' function with that content.
 */
// Main(require("fs").readFileSync("/dev/stdin", "utf8")); // This line is typically used for reading from standard input in competitive programming environments.
Main (   require ( 'fs' ) . readFileSync ( './input.txt' ,   'utf-8' )   ) ; // This line reads input from a local file named 'input.txt'.