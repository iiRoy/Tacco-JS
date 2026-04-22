( function ( rawDataInput ) {
  /*
   * This self-executing function processes a series of commands
   * to manipulate a collection of dynamic data structures.
   * It simulates operations like push, pop, and transfer between these structures.
   */

  // Split the entire input string into individual lines
  const lineFragments = rawDataInput.split( '\n' );

  // The first line indicates the total number of data containers to initialize
  const totalContainers = Number( lineFragments.shift() );

  // Initialize an array to hold our distinct data containers
  const containerCollection = [];

  // Populate the collection with empty arrays, representing our containers
  for ( let containerIndex = 0; containerIndex < totalContainers; containerIndex++ ) {
    containerCollection[ containerIndex ] = [];
  }

  // Begin an infinite loop to process commands until a 'quit' instruction is received
  while ( true ) {
    // Extract the next line, split it by space to get command tokens
    let currentCommandTokens = lineFragments.shift().split( ' ' );

    // The first token is the type of operation
    let operationType = currentCommandTokens[ 0 ];
    // The second token is typically the first operand/argument
    let firstArgument = currentCommandTokens[ 1 ];
    // The third token is typically the second operand/argument, if applicable
    let secondArgument = currentCommandTokens[ 2 ];

    // Check if the current operation is to terminate the program
    if ( operationType === 'quit' ) {
      return; // Exit the function and stop execution
    }

    // Handle the 'push' operation: add an element to a specified container
    if ( operationType === 'push' ) {
      // Convert the argument to a number (0-indexed container) and push the second argument
      containerCollection[ Number( firstArgument ) - 1 ].push( secondArgument );
    }
    // Handle the 'pop' operation: remove and display the last element from a specified container
    else if ( operationType === 'pop' ) {
      // Convert the argument to a number (0-indexed container) and print the popped element
      console.log( containerCollection[ Number( firstArgument ) - 1 ].pop() );
    }
    // Handle any other operation (implicitly 'transfer' based on original logic)
    else {
      // Pop an element from the container specified by the first argument
      let transferredItem = containerCollection[ Number( firstArgument ) - 1 ].pop();
      // Push the popped element onto the container specified by the second argument
      containerCollection[ Number( secondArgument ) - 1 ].push( transferredItem );
    }
  }

// Read the input from standard input using Node.js file system module
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );