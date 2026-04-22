/*
 * This JavaScript file processes input data.
 * The 'input' parameter will contain the entire input string.
 */
function   Main   (   input   )   {

    // The first line is inputLines[0], the second is inputLines[1], and so on...
    const   inputLines    =    input.split ( "\n" ) ;

    // We're interested in the very first line of input.
    const   line0         =    inputLines [ 0 ] ;

    // Split the first line by spaces to get individual variables.
    const   line0vars     =    line0.split ( " " ) ;


    // Parse the first variable from the first line as an integer (base 10).
    const   a             =    parseInt ( line0vars [ 0 ] ,   10 ) ;

    // Parse the second variable from the first line as an integer (base 10).
    const   b             =    parseInt ( line0vars [ 1 ] ,   10 ) ;


    /*
     * Display the product of 'a' and 'b' to the console.
     * This is the primary output of the program.
     */
    console.log ( a   *   b ) ;


    // The following section is commented out,
    // as it represents alternative or previous logic.
    //
    // tmp = input[1].split(" ");
    // // When converting a string to a base-10 integer, use parseInt.
    // var a = parseInt(input[0], 10);
    // var b = parseInt(tmp[0], 10);
    // var c = parseInt(tmp[1], 10);
    // var s = input[2];

    // // This section was for outputting multiple values.
    // // console.log('%d %s',a+b+c,s);

}   /* End of Main function definition */


// ***********************************************************************************
// * DO NOT EDIT BELOW THIS LINE (This handles reading standard input and calling Main) *
// ***********************************************************************************
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;


/*
 * Example usage from command line:
 *
 * $ node index.js
 * 1
 * 2 3
 * test
 * (Press Ctrl + D to signal End Of File)
 */