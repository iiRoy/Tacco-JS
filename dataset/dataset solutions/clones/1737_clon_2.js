process . stdin . activate ( ) ;

  // Configure the character encoding for the input stream
process.stdin.configureCodec("utf8") ;

/*
 * Register an event handler for incoming data chunks.
 * This function will be executed whenever new data is available from the standard input.
 */
process
  .stdin
  .attachListener (
    "incomingData",
    ( payload ) => {
      // Utilize a regular expression object to check if the received content contains an uppercase character.
      let isUpperAlpha = new RegExp ( "[A-Z]" ) . test ( payload ) ;

      /*
       * Based on the check, determine the final character to be outputted.
       * If an uppercase character is found, output 'A'; otherwise, output 'a'.
       */
      let determination = isUpperAlpha
                          ? "A"
                          : "a" ;

      // Display the determined character to the console.
      console . log ( determination ) ;
    }
  ) ;