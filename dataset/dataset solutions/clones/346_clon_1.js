( function ( input ) { // Anonymous function wrapper for the entire script.

  // This function handles addition and subtraction operations within an expression.
  // It evaluates terms and combines them using '+' or '-'.
  function expression() {

    // Start by evaluating a term (which handles multiplication and division).
    var num = term();


    // Loop indefinitely to process subsequent additions or subtractions.
    while ( true ) {

      // Check if the current character is an addition operator.
      if ( code[ cp ] === "+" ) {
        cp++; // Advance the character pointer past the '+' character.
        num += term(); // Add the value of the next term to the current number.
      }
      // Otherwise, check if the current character is a subtraction operator.
      else if ( code[ cp ] === "-" ) {
        cp++; // Advance the character pointer past the '-' character.
        num -= term(); // Subtract the value of the next term from the current number.
      }
      // If neither '+' nor '-' is found, the expression for this level is complete.
      else {
        break; // Exit the loop.
      }
    }

    // Return the final calculated value for this expression.
    return num;
  }


  // This function handles multiplication and division operations within a term.
  // It evaluates bracketed expressions or numbers and combines them using '*' or '/'.
  function term() {

    // Start by evaluating a bracketed expression or a direct number.
    var num = bracket();


    // Loop indefinitely to process subsequent multiplications or divisions.
    while ( true ) {

      // Check if the current character is a multiplication operator.
      if ( code[ cp ] === "*" ) {
        cp++; // Advance the character pointer past the '*' character.
        // Perform multiplication, then floor the result for integer arithmetic.
        num = Math.floor( num * bracket() );
      }
      // Otherwise, check if the current character is a division operator.
      else if ( code[ cp ] === "/" ) {
        cp++; // Advance the character pointer past the '/' character.
        // Perform division, then floor the result for integer arithmetic.
        num = Math.floor( num / bracket() );
      }
      // If neither '*' nor '/' is found, the term for this level is complete.
      else {
        break; // Exit the loop.
      }
    }

    // Return the final calculated value for this term.
    return num;
  }


  // This function handles parentheses and delegates to number parsing.
  // It determines if the current part of the code is a parenthesized expression or a raw number.
  function bracket() {
    var num; // Declare a variable to hold the numerical value.

    // If an opening parenthesis is encountered at the current position.
    if ( code[ cp ] == "(" ) {
      cp++;   /* Skip over the opening parenthesis character. */
      num = expression(); // Recursively evaluate the expression found inside the parentheses.
      cp++;   /* Skip over the closing parenthesis character. */
    }
    // If no opening parenthesis, it signifies a direct number.
    else {
      return number(); // Parse and return the numerical value directly.
    }

    // Return the number obtained either from inside parentheses or directly.
    return num;
  }


  // This function parses a sequence of digits into an integer.
  // It reads characters until a non-digit is encountered.
  function number() {
    var num = 0; // Initialize the number accumulator to zero.

    // Continue as long as the current character is a digit (0-9).
    while ( code[ cp ].match( /[0-9]/ ) ) {
      num *= 10; // Shift existing digits to the left by one decimal place.
      num += parseInt( code[ cp ] ); // Add the new digit's integer value.
      cp++; // Move to the next character in the code string.
    }

    // Return the fully parsed integer value.
    return num;
  }


  // --- Main execution block starts here for processing input expressions ---

  // Process the raw input string:
  // 1. Remove all carriage return characters (\r).
  // 2. Split the string into an array of lines based on newline characters (\n).
  var inputs = input.replace( /\r/g, '' ).split( "\n" ),
    cp, // 'cp' stands for 'character pointer', indicating the current position in the 'code' string.
    n;  // 'n' will store the number of expressions that need to be evaluated.

  // Parse the first line of the 'inputs' array as an integer. This is the count of expressions.
  n = parseInt( inputs.shift() );


  // Loop 'n' times, decrementing 'n' in each iteration until it reaches zero.
  while ( n-- ) {
    // Get the next line from 'inputs', which represents a mathematical expression.
    // Remove all whitespace characters from this expression string.
    var code = inputs.shift().replace( /\s/g, "" );
    cp = 0; // Reset the character pointer to the beginning of the new 'code' string.

    // Evaluate the processed mathematical expression using the 'expression' function
    // and print the resulting integer value to the console.
    console.log( expression() );
  }

} )( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ); // Immediately invoke the main function,
                                                         // passing the content of standard input as a string.