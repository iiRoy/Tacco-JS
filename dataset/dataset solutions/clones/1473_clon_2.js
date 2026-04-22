( function ( sourceContent ) {
  // Process the incoming raw string by splitting it into individual lines.
  sourceContent = sourceContent . split ( "\n" ) ;

  var instructionSet = [ ] ; // An array to hold all parsed command instructions.
  var containerRegistry = [ ] ; // A collection of stacks, indexed by arbitrary names.
  var instructionPointer = 0 ; // Keeps track of the current command to execute.

  // Iterate through each line of the input to parse commands.
  for ( var lineCounter = 0 ; lineCounter < sourceContent . length ; lineCounter ++ ) {
    // Each line is further split by spaces to separate command and its arguments.
    instructionSet [ lineCounter ] = sourceContent [ lineCounter ] . split ( " " ) ;
  }

  // Advance the pointer past the initial line, assuming it's a header or metadata.
  instructionPointer ++ ;

  // Execute commands until the "quit" instruction is encountered.
  while ( instructionSet [ instructionPointer ] [ 0 ] != "quit" ) {

    // Determine the type of the current command.
    switch ( instructionSet [ instructionPointer ] [ 0 ] ) {
      case "push" :
        // If the target container doesn't exist or isn't an array, initialize it.
        if ( ! ( containerRegistry [ instructionSet [ instructionPointer ] [ 1 ] ] instanceof Array ) ) {
          containerRegistry [ instructionSet [ instructionPointer ] [ 1 ] ] = [ ] ;
        }
        // Add the specified element to the designated container.
        containerRegistry [ instructionSet [ instructionPointer ] [ 1 ] ] . push ( instructionSet [ instructionPointer ] [ 2 ] ) ;
        instructionPointer ++ ; // Move to the next operation.
        break ;

      case "pop" :
        // Retrieve the topmost item from the specified container.
        var retrievedElement = containerRegistry [ instructionSet [ instructionPointer ] [ 1 ] ] . pop ( ) ;
        // Display the retrieved item to standard output.
        console . log ( retrievedElement ) ;
        instructionPointer ++ ; // Advance to the subsequent instruction.
        break ;

      case "move" :
        // Ensure the destination container is properly initialized.
        if ( ! ( containerRegistry [ instructionSet [ instructionPointer ] [ 2 ] ] instanceof Array ) ) {
          containerRegistry [ instructionSet [ instructionPointer ] [ 2 ] ] = [ ] ;
        }
        // Extract an item from the source container.
        var transferredObject = containerRegistry [ instructionSet [ instructionPointer ] [ 1 ] ] . pop ( ) ;
        // Place the extracted item into the destination container.
        containerRegistry [ instructionSet [ instructionPointer ] [ 2 ] ] . push ( transferredObject ) ;
        instructionPointer ++ ; // Proceed to the next line of commands.
        break ;
    }
  }
} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;