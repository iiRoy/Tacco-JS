/* This is a Type I clone, preserving all identifiers and logic.
   Whitespace and comments have been extensively modified to create visual differences. */

// Resume stdin to allow input to flow
process.stdin . resume ( ) ;

// Set the encoding for incoming data chunks
process.stdin . setEncoding ( 'utf8' ) ;


/* Initialize an empty string to accumulate all input data.
   This variable will hold the entire standard input content. */
var input = '' ;


// Attach a listener for the 'data' event.
// This function is called whenever a new chunk of data is received.
process . stdin . on ( 'data' , function ( chunk ) {

  // Append the received chunk to the 'input' string.
  input += chunk ;

} ) ;


// Attach a listener for the 'end' event.
// This function is called once all input has been received.
process . stdin . on ( 'end' , function ( ) {

  // Split the accumulated input string into an array of lines.
  // Each line is separated by a newline character.
  var lines = input . split ( '\n' ) ;

  // Initialize a line counter, starting from the first line (index 0).
  var l = 0 ;

  // Begin an infinite loop to process loan scenarios.
  // The loop will explicitly break when a specific condition is met.
  while ( true ) {

    // Parse the current line as an integer to get the loan amount.
    // The 'l++' increments the line counter after using its current value.
    var loan = parseInt ( lines [ l ++ ] ) ;

    // Check if the parsed loan amount is zero.
    // A loan of 0 signals the end of input or scenarios.
    if ( loan === 0 ) {

      // If loan is 0, exit the processing loop.
      break ;

    }

    // Initialize the answer variable to 'NA' (Not Available/Applicable).
    // This will be updated if the loan is paid off within 12 months.
    var ans = 'NA' ;

    // Loop through 12 months (or up to 12 monthly payments/transactions).
    for ( var i = 0 ; i < 12 ; i ++ ) {

      // Split the current line (representing monthly data) by space.
      // This usually gives two values: income and expense for the month.
      var vs = lines [ l ++ ] . split ( ' ' ) ;

      // Update the loan amount: subtract (income - expense) for the month.
      // vs[0] is typically income, vs[1] is expense.
      loan -= vs [ 0 ] - vs [ 1 ] ;

      // Check if the loan has been paid off (loan <= 0) AND
      // if the answer has not yet been set (still 'NA').
      if ( ans === 'NA' && loan <= 0 ) {

        // If both conditions are true, set the answer to the current month + 1.
        // '+ 1' because 'i' is zero-indexed (0-11 for 12 months).
        ans = i + 1 ;

      }

    }

    // Output the final answer for the current loan scenario.
    // This will be 'NA' if the loan wasn't paid off, or the month number.
    console . log ( ans ) ;

  }

} ) ;