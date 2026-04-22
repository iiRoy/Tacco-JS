/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */
function         Main (   input   )
{
    // Process the input string into an array of lines.
    input   =   input .   split (   "\n"   )   ;


    // Parse the first line to get N. The -0 converts string to number.
    const   N   =   input[0]   -   0   ;

    var     temp   ; // Temporary array for line data

    var     t   ,   a   ; // Variables t and a

    var     n   ; // Variable for multiplication factor


    // Initialize t and a from the second line of input.
    // The -0 converts string parts to numbers.
    t   =   input[1] .   split (   " "   )   [0]   -   0   ;
    a   =   input[1] .   split (   " "   )   [1]   -   0   ;


    // Loop through the remaining input lines, starting from the third line (index 2).
    for   (   var   i   =   2   ;   i   <   input .   length   ;   i++   )
    {
        // Split the current line by space to get two values.
        temp   =   input[i] .   split (   " "   )   ;

        // Convert the first two elements of 'temp' to numbers.
        [   0   ,   1   ] .   forEach   (   e   =>   {
            temp[e]   -=   0   ; // Equivalent to temp[e] = Number(temp[e])
        }   )   ;

        // This 'counter' variable is declared but unused in the original logic.
        var   counter   =   1   ;

        // Calculate the minimum factor 'n' required to satisfy both t and a ratios.
        n   =   Math .   ceil   (   Math .   max (   t   /   temp[0]   ,   a   /   temp[1]   )   )   ;

        // Update t and a based on the calculated factor 'n'.
        t   =   temp[0]   *   n   ;
        a   =   temp[1]   *   n   ;
    }

    // Output the sum of the final values of 'a' and 't'.
    console .   log   (   a   +   t   )   ;
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));