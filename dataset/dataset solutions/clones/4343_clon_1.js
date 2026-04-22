/*
 * This is a Type I clone of the original JavaScript code.
 * The purpose of this clone is to demonstrate Type I equivalence,
 * where only whitespace and comments have been altered.
 * All functional aspects, identifiers, operators, and expressions
 * remain absolutely identical to the source.
 */
( function  ( )
{
  'use strict'  ;  //  Enforce strict parsing and error handling in the script.

  //  Declare an array named 'lines' to store input data.
  var       lines      =      [ ]      ;

  //  Initialize the readline interface to handle standard input line by line.
  require ( 'readline' )
    . createInterface (
      {
        input   :   process . stdin   ,   //  Input source: standard input stream.
        output  :   process . stdout    //  Output destination: standard output stream (not used for readline output itself, but required by API).
      }
    )
    . on (
      'line'  ,
      function  ( line )
      {
        //  Callback function executed for each line read from standard input.
        lines . push ( line ) ;   //  Add the current line to our 'lines' array.
      }
    ) ;

  //  Set up an event listener for when the standard input stream finishes.
  process . stdin . on (
    'end'   ,
    function  ( )
    {
      //  This section contains a block of code that was previously commented out.
      //  It's preserved here as a multi-line comment to maintain Type I integrity.
      /*
      lines.forEach(function(line) {
        var tokens = line.split(' ').map(Number);
            console.log(tokens[0] + ' ' + tokens[1]);
      }
      );
      */
      ;   //  An empty statement, potentially a leftover or placeholder.

      //  --- Start of the primary calculation logic ---
      //  The following line was also commented out in the original source,
      //  likely a temporary variable or an alternative approach.
      //  //var line2token = lines[1].split(" ")

      //  Perform the core calculation: (first_line_as_int)^2 - (second_line_as_int).
      //  The result is then printed to the console.
      console . log (
        Math . pow (
          parseInt ( lines [ 0 ] )   ,   //  Parse the first line as an integer for the base.
          2                            //  The exponent is 2.
        )
        -
        parseInt ( lines [ 1 ] )       //  Parse the second line as an integer for subtraction.
      ) ;
      //  --- End of the primary calculation logic ---

    }
  ) ;


} ) ( ) ; //  The Immediately Invoked Function Expression (IIFE) concludes here.