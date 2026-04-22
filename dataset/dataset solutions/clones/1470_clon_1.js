( function ( input )
{
  // This is a self-executing anonymous function that processes input.
  /*
    The purpose of this function is to simulate a simple stack machine
    based on commands read from the input.
  */

  input = input . split ( "\n" ) ; /* Split the entire input string by newline characters
                                         to get individual lines of commands. */

  var data  =  [ ] ;  // Declare an array to hold parsed command data.
  var stack = [ ]  ; // Declare a stack (array) for push/pop operations.
  var index = 0 ;   /* Initialize an index to keep track of the current
                         command line being processed. */

  // Loop through each line of the input to parse commands and their arguments.
  for ( var i = 0 ; i < input . length ; i++ )
  {
    /* For each line, split it by space to separate the command
       from its argument (if any) and store it in the 'data' array. */
    data [ i ] = input [ i ] . split ( " " ) ;
  }

  // Process commands until a "quit" command is encountered.
  while ( data [ index ] [ 0 ] != "quit" )
  {
    // Use a switch statement to handle different command types.
    switch ( data [ index ] [ 0 ] )
    {
      case "push" :
        // If the command is "push", add the argument to the stack.
        stack . push ( data [ index ] [ 1 ] ) ;
        index++ ; // Move to the next command.
        break ; // Exit the switch statement.

      case "pop" :
        // If the command is "pop", remove and retrieve the top element from the stack.
        var p = stack . pop ( ) ;
        console . log ( p ) ; // Print the popped element to the console.
        index++ ; // Move to the next command.
        break ; // Exit the switch statement.
    }
  }

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // IIFE immediately invoked with file system input.