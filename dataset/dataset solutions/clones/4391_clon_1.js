// This script is designed to read input from stdin, process it, and output to stdout.
// It uses the 'readline' module for handling line-by-line input.

process.stdin.resume(); // Ensures stdin stream remains open.

process.stdin.setEncoding('utf8'); // Specifies the encoding for input data.

// An array to store all incoming lines from stdin.
var lines = [ ];

// Initialize the readline interface for input/output operations.
var reader = require('readline').createInterface(
  {
    input  :   process.stdin, // Use standard input.
    output :   process.stdout // Use standard output.
  }
);

// Event listener for each line of input received.
reader.on('line',
  ( line ) => {
    // Add the current line to the collection of lines.
    lines.push( line );
  }
); // End of 'line' event handler.

// Event listener for when the input stream closes.
reader.on('close',
  () => {

    // Parse the first line of input.
    // It contains four space-separated values: Q, H, S, D.
    // Each value is converted to a number.
    const [ Q , H , S , D ] = lines [ 0 ] . split ( " " ) . map ( v => v - 0 ) ;

    // Parse the second line of input, which is N, and convert it to a number.
    const N = lines [ 1 ] - 0 ;

    // Logic to determine the minimum cost based on N and the unit prices.

    if ( N / 2 === 0 ) { // If N is an even number, meaning N/2 has no remainder.
                         // This condition is actually checking if N is 0,
                         // as N/2 === 0 is only true if N is 0.
                         // For N=2, N/2=1, 1===0 is false.
                         // The original code likely intended 'N % 2 === 0' for even numbers.
                         // However, per Type I clone rules, this must remain unchanged.

        // Calculate the cost per 2 units of volume if N is effectively 0.
        // This part of the code will likely only run if N is 0.
        const unit = Math.min( Q * 8 , H * 4 , S * 2 , D ) ;

        // Output the total calculated cost.
        console . log ( N / 2 * unit ) ;

    } else { // If N is an odd number or any non-zero even number (due to the `N/2===0` condition).

        // Calculate the minimum cost for a single unit volume.
        const unit1 = Math.min( Q * 4 , H * 2 , S ) ;

        // The cost for two units of volume using the special 'D' price.
        const unit2 = D ;

        // Compare the cost of buying two single units versus one 'D' unit.
        if ( unit1 * 2 < D ) { // If buying two single units is cheaper than one 'D' unit.

            // Output the total cost by buying N single units.
            console . log ( N * unit1 ) ;

        } else { // If buying one 'D' unit (for two volumes) is cheaper or equal to two single units.

            // Calculate the cost:
            // Integer division of N by 2 (~~(N/2)) to find how many 'D' units can be bought.
            // Add the cost of one remaining single unit if N is odd (N % 2 === 1).
            // Note: N/2 yields 0.5 for N=1, 1.5 for N=3, etc. ~~ truncates this.
            // Example: N=3. ~~(3/2) = ~~1.5 = 1. So 1 * unit2 + unit1.
            console . log ( ~~ ( N / 2 ) * unit2 + unit1 ) ;

        } // End of inner 'if-else' block.

    } // End of outer 'if-else' block.

  }
); // End of 'close' event handler.