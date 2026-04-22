/*
 *  This is a Type I clone of the original JavaScript code.
 *  It strictly follows the definition: "Code fragments are exactly equal,
 *  except for possible variations in whitespace and comments."
 *
 *  No identifiers, variable names, function names, operators, or expressions
 *  have been modified. Only changes to spacing, indentation, blank lines,
 *  and comments have been applied to create visual difference.
 */

  //  Enable strict mode for the entire script, promoting cleaner code
  //  and catching common coding errors.
  'use strict'


  /**
   *  The primary function responsible for processing the input and
   *  determining the output based on specific conditions.
   *
   *  @param {string} input - The raw string input, expected to contain
   *                          space-separated numbers on its first line.
   */
  const   main    =   input   =>  {

    //  First, split the input by newline characters and take only the first line.
    //  Then, split that first line by space characters to get individual arguments.
    const   args    =   input . split ( '\n' ) [ 0 ] . split ( ' ' )

    //  Parse the first argument from the array 'args' into an integer (base 10).
    const   a   =   parseInt ( args [ 0 ] , 10 )

    //  Parse the second argument from the array 'args' into an integer (base 10).
    const   b   =   parseInt ( args [ 1 ] , 10 )


    //  Begin conditional evaluation based on the value of 'a'.
    if  (   a   >=  13  )   {
      //  If 'a' is 13 or greater, simply log the value of 'b'.
      console . log ( b )
    }
    else    if  (   a   >=  6   )   {
      //  Otherwise, if 'a' is 6 or greater (but less than 13),
      //  log 'b' divided by 2.
      console . log ( b   /   2 )
    }
    else    {
      //  If neither of the above conditions is met (i.e., 'a' is less than 6),
      //  log the integer 0.
      console . log ( 0 )
    }
  }


  //  This single line executes the main function.
  //  It reads the content of '/dev/stdin' (standard input) as a UTF-8 string
  //  using Node.js's 'fs' module, and passes it to the 'main' function.
  main  ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) )