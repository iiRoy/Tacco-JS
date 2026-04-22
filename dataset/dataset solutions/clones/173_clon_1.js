var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size
  , buffer = new Buffer(length)
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , input = buffer.toString('utf8', 0, bytesRead).trim().split('\n')
; // This block handles standard input reading for the program.

main(); // Execute the primary function.


function main() {
  /*
   * Main processing loop: iterates through each line of input.
   */
  for (var i = 0, len = input.length; i < len; i++) {

    // Split the current input line into individual characters (tiles).
    var c = input[i].split('');

    // Initialize a frequency counter for tiles (0-9).
    // Index 0 is unused, indices 1-9 store counts for respective tiles.
    var count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Populate the frequency counter based on the input characters.
    for (var j = 0, jlen = c.length; j < jlen; j++) {
      count[c[j]]++; /* Increment count for the current tile. */
    }


    var result = []; // Stores the potential "winning" tiles.


    // Outer loop: iterates through possible tiles to "draw" (from 1 to 9).
    JLOOP: for (var j = 1; j <= 9; j++) {
      // This is the "draw a tile" loop.

      // Skip this tile if it's already at max count (4)
      // or if it's an isolated tile (no adjacent tiles present)
      // which cannot form a sequence.
      if (count[j] == 4 || (!count[j - 1] && !count[j] && !count[j + 1])) {
        continue;
      }


      // Inner loop: iterates through possible tiles to "discard" (from 1 to 9).
      for (var k = 1; k <= 9; k++) {

        // Only consider discarding a tile if we actually have it.
        if (count[k] == 0) {
          continue;
        }


        // Create a temporary copy of the tile counts for simulation.
        var count3 = count.slice(0);

        // Simulate drawing tile 'j'.
        count3[j]++;

        // Simulate discarding two tiles 'k' (removing a pair).
        count3[k] -= 2;


        // Attempt to form sets (sequences and triplets) with the remaining tiles.
        for (var l = 1; l <= 9; l++) {

          // Check for a sequence (l-1, l, l+1) and remove it if found.
          if (count3[l - 1] >= 1 && count3[l] >= 1 && count3[l + 1] >= 1) {
            count3[l - 1]--;
            count3[l]--;
            count3[l + 1]--;
          }

          // Check for another sequence (l-1, l, l+1) and remove it if found.
          // This allows for two sequences involving the same l.
          if (count3[l - 1] >= 1 && count3[l] >= 1 && count3[l + 1] >= 1) {
            count3[l - 1]--;
            count3[l]--;
            count3[l + 1]--;
          }

          // Check for a triplet (l, l, l) and remove it if found.
          if (count3[l] >= 3) {
            count3[l] -= 3;
          }
        }

        var sum = 0; // Calculate the sum of remaining tiles after forming sets.
        for (var l = 1; l <= 9; l++) {
          sum += count3[l];
        }

        // If 'sum' is 0, it means all tiles formed valid sets.
        // This implies 'j' is a winning draw.
        if (!sum) {
          result.push(j);        // Add 'j' to the results.
          continue JLOOP;        // Move to the next potential draw tile 'j'.
        }
      }
    }

    // Output the results. If no winning tiles, print '0'.
    // Otherwise, print the winning tiles separated by spaces.
    console.log(result.length ? result.join(' ') : '0');

  } // End of the main input line processing loop.

} // End of the 'main' function definition.