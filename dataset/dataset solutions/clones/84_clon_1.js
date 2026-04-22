/*
 * This is a Type I clone example generated from an original JavaScript snippet.
 * The core logic, variable names, function names, and expressions remain
 * absolutely identical to the source code.
 *
 * All modifications are strictly limited to whitespace (indentation,
 * spacing, blank lines) and comments (addition, removal, or alteration).
 * The goal is to make the code appear visually distinct while preserving
 * its exact functional equivalence.
 */

var  // Declare the 'sys' variable, which is used for system-level operations.
    sys    =    require ( 'sys' ) ;   /*  Import the built-in 'sys' module.  */


//  Define the primary function of this script.
function   main ( )
{
    //  Access the 'sys' module's 'print' method to output data.
    //  The 'input' variable's content is converted to uppercase before printing.
    sys  .  print (   input  .  toUpperCase ( )   ) ;

} //  End of the 'main' function definition.


var    input    =    '' ;   //  Initialize an empty string to accumulate all standard input data.


//  Begin listening for data on standard input.
process  .  stdin  .  resume ( ) ;


//  Set the character encoding for the standard input stream to 'utf8'.
process  .  stdin  .  setEncoding ( 'utf8' ) ;


/*
 *  Attach an event listener to the 'data' event of the standard input stream.
 *  This callback function executes every time a new chunk of data is received.
 */
process  .  stdin  .  on (   'data'  ,    function (   chunk   )
{
    //  Append the received 'chunk' of data to our 'input' string.
    input    +=    chunk ;

}   ) ; //  End of the 'data' event handler.


/*
 *  Attach another event listener to the 'end' event of the standard input stream.
 *  This signifies that no more data will be provided from the input source.
 */
process  .  stdin  .  on (   'end'  ,    function ( )
{
    //  Once all input has been collected, call the 'main' function to process it.
    main ( ) ;

}   ) ; //  End of the 'end' event handler.