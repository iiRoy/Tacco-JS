/*
 * This JavaScript file processes input data.
 * The Main function is the entry point for execution.
 * It expects 'input' as a string containing various data.
 */
function     Main  (  input  )
{
    // The initial comment regarding input data structure.
    // inputに入力データ全体が入る - This original note is important.

    // First, we process the input string.
    // It's split by newline, then the second line is taken,
    // and that line is further split by spaces to form a list of string elements.
    var   list   =   input .   split (  "\n"  )   [  1  ] .   split (  " "  )  ;

    // This loop continues as long as the 'list' contains more than two elements.
    // It effectively performs a reduction operation on the list.
    while (  list .   length   !=   2  )
    {
        // Extract the first three elements from the current list.
        // These are parsed as integers.
        var   mae   =   parseInt (  list [  0  ]  )  ;
        var   naka   =   parseInt (  list [  1  ]  )  ;
        var   ato   =   parseInt (  list [  2  ]  )  ;

        // Perform additions: 'mae' and 'ato' are updated by adding 'naka'.
        mae   =   mae   +   naka  ;
        ato   =   ato   +   naka  ;

        // Create a temporary list by slicing the original list,
        // starting from the fourth element (index 3) up to its end.
        var   tmpList   =   list .   slice (  3  ,   list .   length  )  ;

        // Add the modified 'ato' and 'mae' values to the beginning of the temporary list.
        // Note: unshift adds elements to the front.
        tmpList .   unshift (  ato  )  ;
        tmpList .   unshift (  mae  )  ;

        // The original 'list' is then replaced with this new, reduced 'tmpList'.
        list   =   tmpList  ;
    }

    // Once the loop terminates, the 'list' should contain exactly two elements.
    // These two remaining elements are parsed as integers and their sum is calculated.
    var   output   =   parseInt (  list [  0  ]  )   +   parseInt (  list [  1  ]  )  ;

    // The final calculated result is printed to the standard output.
    console .   log (  output  )  ;
}

/*
 * The following lines are crucial for the execution environment.
 * They handle the standard input/output operations.
 * DO NOT MODIFY THEM under any circumstances.
 * They ensure the 'Main' function receives its required input data.
 */
// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main (  require (  "fs"  ) .   readFileSync (  "/dev/stdin"  ,   "utf8"  )  )  ;