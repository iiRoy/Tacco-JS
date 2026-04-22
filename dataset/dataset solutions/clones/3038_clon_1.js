"use strict"; /* This directive enables strict mode for the entire script. */


function main(input) { // The primary function where the program's logic resides.

  // The input string is split by newline characters to separate different lines of data.
  const args = input.split('\n');


  // The first line of input (args[0]) is parsed as an integer to get the value of N.
  const N = parseInt(args[0]);

  // The second line of input (args[1]), representing the stones, is split into individual characters.
  const stones = args[1].split('');


  let cam_count = 0; // Initialize a counter for Camellia stones (represented by '.').
  let sya_count = 0; // Initialize a counter for Sazanka stones (represented by '#').


  // Iterate through the array of stones from the first stone up to, but not including, the N-th stone.
  for (let i = 0; i < N; i++) {

    // Check the current stone's type.
    if (stones[i] == '.') { // If the current stone is a Camellia.
      cam_count++; // Increment the Camellia counter.
    } else if (stones[i] == '#') { // If the current stone is a Sazanka.
      sya_count++; // Increment the Sazanka counter.
    }

  }


  // Calculate the answer: the minimum of the two counts.
  // This uses a ternary operator: (condition) ? value_if_true : value_if_false.
  const ans = cam_count < sya_count ? cam_count : sya_count;


  // Output the final calculated answer to the console.
  console.log(ans);
}


// This line reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string,
// and then passes that string to the 'main' function to begin processing.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));