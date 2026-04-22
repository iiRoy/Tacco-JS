/*
 * This script processes standard input to solve a mathematical puzzle.
 * It reads numbers and operators to find combinations that evaluate to 10.
 *
 * Input format: Four space-separated integers on each line,
 *               terminated by a line of "0 0 0 0".
 * Output format: The mathematical expression evaluating to 10,
 *                or 0 if no such expression is found.
 */
var fs       = require('fs')
  , length   = fs.fstatSync(process.stdin.fd).size
  , buffer   = new Buffer(length)
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , input    = buffer.toString('utf8', 0, bytesRead).trim().split('\n')
;

// Start the main execution flow.
main( );

function main ( ) {

  // Define the available arithmetic operands.
  var operands = [ '+', '-', '*' ];

  var inp; // Variable to hold the current line of input.

  // Loop through each line of input until the termination condition is met.
  for ( var i = 0 ; (inp = input[i]) != '0 0 0 0' ; i++ ) {

    // Parse the input line into an array of numbers.
    inp       = inp.split(' ').map(Number);
    var found = false; // Flag to indicate if a solution was found for the current input.

    /*
     * Outer loops to select four distinct numbers from the input array.
     * The label 'FIRST' is used for a multi-level break.
     */
    FIRST: for ( var a = 0 ; a < 4 ; a++ ) {
      var inpa = inp[a]; // Store value to reduce array access inside inner loops.

      for ( var b = 0 ; b < 4 ; b++ ) {
        if ( a == b ) continue; // Ensure distinct numbers.
        var inpb = inp[b];

        for ( var c = 0 ; c < 4 ; c++ ) {
          if ( a == c || b == c ) continue; // Ensure distinct numbers.
          var inpc = inp[c];

          for ( var d = 0 ; d < 4 ; d++ ) {
            if ( a == d || b == d || c == d ) continue; // Ensure distinct numbers.
            var inpd = inp[d];

            // Loop through all possible combinations of three operators.
            for ( var op1 = 0 ; op1 < 3 ; op1++ ) {
              var operandsop1 = operands[op1];

              for ( var op2 = 0 ; op2 < 3 ; op2++ ) {
                var operandsop2 = operands[op2];

                for ( var op3 = 0 ; op3 < 3 ; op3++ ) {
                  var operandsop3 = operands[op3];

                  // Skip a specific, potentially redundant, operator combination (all subtractions).
                  if ( op1 == 1 && op2 == 1 && op3 == 1 ) continue;

                  // Iterate through different Polish notation patterns.
                  for ( var pattern = 0 ; pattern < 3 ; pattern++ ) {
                    var polish = [ ]; // Array to store the expression in Reverse Polish Notation.

                    switch ( pattern ) {
                      case 0:
                        // pattern1: num num op num op num op (((a op1 b) op2 c) op3 d)
                        polish = [ inpa , inpb , operandsop1 , inpc , operandsop2 , inpd , operandsop3 ];
                        break;
                      case 1:
                        // pattern2: num num num op op num op ((a op2 (b op1 c)) op3 d)
                        polish = [ inpa , inpb , inpc , operandsop1 , operandsop2 , inpd , operandsop3 ];
                        break;
                      case 2:
                        // pattern3: num num num num op op op ((c op1 d) op3 (a op2 b))
                        polish = [ inpa , inpb , operandsop1 , inpc , inpd , operandsop2 , operandsop3 ];
                        break;
                    }

                    // Evaluate the RPN expression using a stack.
                    var stack = [ ];
                    for ( var j = 0 ; j < 7 ; j++ ) {
                      var h = polish[j]; // Current element from the RPN array.

                      switch ( h ) {
                        case '+':
                          stack.push( stack.pop() + stack.pop() );
                          break;
                        case '-':
                          // Subtraction is non-commutative, order matters.
                          stack.push( -stack.pop() + stack.pop() );
                          break;
                        case '*':
                          stack.push( stack.pop() * stack.pop() );
                          break;
                        default:
                          // If it's a number, push it onto the stack.
                          stack.push( h );
                          break;
                      }
                    }

                    // Check if the final result is 10.
                    if ( stack.pop() == 10 ) {
                      found = true; // A solution has been found.

                      var result = [ ]; // Array to reconstruct the infix expression.
                      var l, r;       // Left and right operands for binary operations.

                      // Reconstruct the infix expression from RPN.
                      for ( var j = 0 ; j < 7 ; j++ ) {
                        var h = polish[j];
                        if ( h == '+' || h == '-' || h == '*' ) {
                          r = result.pop(); // Pop right operand.
                          l = result.pop(); // Pop left operand.
                          result.push( "(" + l + " " + h + " " + r + ")" ); // Push parenthesized expression.
                        } else {
                          result.push( h ); // Push number directly.
                        }
                      }

                      // Output the solution and break out of all nested loops.
                      console.log( result.pop() );
                      break FIRST; // Exit the outermost number-selection loop.
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // If no solution was found for the current input line, print 0.
    if ( !found )
      console.log( 0 );

  }
}