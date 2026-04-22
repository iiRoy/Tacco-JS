/*
 *  This script reads input from standard input,
 *  processes it to find if a combination of four numbers
 *  and three arithmetic operations (+, -, *) can result in 10.
 *  The numbers are taken from the input line.
 *  The program tries different permutations of numbers and operator patterns.
 *  If a solution is found, it prints the expression; otherwise, it prints 0.
 */

var fs = require('fs') ,
    length = fs.fstatSync( process.stdin.fd ).size ,
    buffer = new Buffer( length ) ,
    bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 ) ,
    input = buffer.toString( 'utf8', 0, bytesRead ).trim().split( '\n' );

// Execute the main logic of the program.
main();

/**
 * The primary function containing the core logic for solving the Ten Puzzle.
 */
function main() {
  // Define the set of available arithmetic operations.
  var operands = [ '+' , '-' , '*' ];

  var inp ; // Variable to hold the current input line as an array of numbers.

  // Loop through each line of input until a termination condition ('0 0 0 0') is met.
  for ( var i = 0 ; ( inp = input[i] ) != '0 0 0 0' ; i++ ) {

    /*
     * Convert the input string (e.g., "1 2 3 4") into an array of numbers.
     * The `Int8Array` is used for memory efficiency, assuming numbers are small.
     */
    inp = new Int8Array( inp.split( ' ' ).map( Number ) );

    var found = false ; // Flag to indicate if a solution resulting in 10 has been found for the current input.

    // This array helps to avoid redundant computations for permutations of numbers.
    var searched = new Int8Array( 10000 );

    // This label allows breaking out of all nested loops once a solution is found.
    FIRST:
    for ( var a = 0 ; a < 4 ; a++ ) {
      // Store the value to reduce repeated array accesses.
      var inpa = inp[a] ;

      for ( var b = 0 ; b < 4 ; b++ ) {
        // Ensure that 'b' is a different index from 'a'.
        if ( a == b ) continue ;
        var inpb = inp[b] ;

        for ( var c = 0 ; c < 4 ; c++ ) {
          // Ensure 'c' is distinct from 'a' and 'b'.
          if ( a == c || b == c ) continue ;
          var inpc = inp[c] ;

          for ( var d = 0 ; d < 4 ; d++ ) {
            // Ensure 'd' is distinct from 'a', 'b', and 'c'.
            if ( a == d || b == d || c == d ) continue ;
            var inpd = inp[d] ;

            /*
             *  Construct a unique identifier for the current permutation of numbers (a, b, c, d).
             *  This effectively creates a 4-digit number to use as an index in the 'searched' array.
             */
            var target = inpa * 1000 + inpb * 100 + inpc * 10 + inpd ;

            // If this permutation has already been processed, skip it.
            if ( searched[target] ) {
              continue ;
            }

            // Mark this permutation as searched.
            searched[target]++;


            // Iterate through all possible combinations for the first operator.
            for ( var op1 = 0 ; op1 < 3 ; op1++ ) {
              var operandsop1 = operands[op1] ;

              // Iterate through all possible combinations for the second operator.
              for ( var op2 = 0 ; op2 < 3 ; op2++ ) {
                var operandsop2 = operands[op2] ;

                // Iterate through all possible combinations for the third operator.
                for ( var op3 = 0 ; op3 < 3 ; op3++ ) {
                  var operandsop3 = operands[op3] ;

                  // Optimization: If all three operators are subtraction, it's unlikely to reach 10 with positive numbers.
                  // This is a specific optimization that might not be generally applicable but is present in the original.
                  if ( op1 == 1 && op2 == 1 && op3 == 1 ) continue ;


                  // Explore different patterns for placing the operators relative to the numbers.
                  for ( var pattern = 0 ; pattern < 3 ; pattern++ ) {
                    var polish = [] ; // Will store the expression in Reverse Polish Notation (RPN).

                    switch ( pattern ) {
                      case 0:
                        /*
                         * Pattern 1: (((a op1 b) op2 c) op3 d)
                         * RPN: a b op1 c op2 d op3
                         */
                        polish = [ inpa, inpb, operandsop1, inpc, operandsop2, inpd, operandsop3 ] ;
                        break;

                      case 1:
                        /*
                         * Pattern 2: ((a op2 (b op1 c)) op3 d)
                         * RPN: a b c op1 op2 d op3
                         */
                        polish = [ inpa, inpb, inpc, operandsop1, operandsop2, inpd, operandsop3 ] ;
                        break;

                      case 2:
                        /*
                         * Pattern 3: ((c op1 d) op3 (a op2 b))
                         * RPN: a b op1 c d op2 op3
                         */
                        polish = [ inpa, inpb, operandsop1, inpc, inpd, operandsop2, operandsop3 ] ;
                        break;
                    }


                    var stack = [] ; // Stack used for RPN evaluation.

                    // Evaluate the expression in Reverse Polish Notation.
                    for ( var j = 0 ; j < 7 ; j++ ) {
                      var h = polish[j] ;
                      switch ( h ) {
                        case '+':
                          // Pop two operands, add them, push result.
                          stack.push( stack.pop() + stack.pop() );
                          break;
                        case '-':
                          // Pop right operand, pop left operand, subtract (left - right), push result.
                          stack.push( -stack.pop() + stack.pop() );
                          break;
                        case '*':
                          // Pop two operands, multiply them, push result.
                          stack.push( stack.pop() * stack.pop() );
                          break;
                        default:
                          // If it's a number, push it onto the stack.
                          stack.push( h );
                          break;
                      }
                    }

                    // After evaluation, if the final result on the stack is 10, a solution is found.
                    if ( stack.pop() == 10 ) {
                      found = true ; // Set the flag to true.

                      var result = [] ; // Used to reconstruct the infix expression.
                      var l , r ;       // Left and right operands for reconstruction.

                      // Reconstruct the infix expression from RPN.
                      for ( var j = 0 ; j < 7 ; j++ ) {
                        var h = polish[j] ;
                        if ( h == '+' || h == '-' || h == '*' ) {
                          r = result.pop() ; // Get right operand.
                          l = result.pop() ; // Get left operand.
                          // Push the parenthesized infix expression.
                          result.push( "(" + l + " " + h + " " + r + ")" );
                        } else {
                          // If it's a number, push it directly.
                          result.push( h );
                        }
                      }

                      // Print the found expression.
                      console.log( result.pop() );
                      // Break out of all loops as a solution has been found for this input.
                      break FIRST ;
                    }
                  } // End of pattern loop
                } // End of op3 loop
              } // End of op2 loop
            } // End of op1 loop
          } // End of d loop
        } // End of c loop
      } // End of b loop
    } // End of a loop

    // If no solution was found for the current input line, print 0.
    if ( !found ) {
      console.log( 0 );
    }

  } // End of input lines loop
} // End of main function