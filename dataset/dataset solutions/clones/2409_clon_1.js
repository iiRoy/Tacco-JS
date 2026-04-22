'use strict'; /* This directive enables strict mode, catching common coding errors and preventing some problematic syntax. */

const main = input => { // Main function definition, taking 'input' as a parameter.
  // It's assumed that 'inputS' is a global variable or somehow available in this scope.
  input = inputS.trim().split('\n'); // First, we clean up the raw input string by trimming whitespace and splitting it into an array of lines.

  const kukan = input[1].split(' '); // We extract the second line (index 1) from the input array and then split it by spaces.

  const kukanInt = kukan.map(n => parseInt(n, 10)); // Convert each string segment (n) in 'kukan' into an integer, using base 10.

  const nagasa = kukanInt.reduce((x, y) => x + y); // Calculate the total sum of all integers in the 'kukanInt' array.
  const mokuhyo = nagasa / 2; // Determine the target value, which is exactly half of the total sum ('nagasa').

  // The following lines are commented out, likely for debugging purposes, and are retained as comments.
  // console.log('Debug: Total sum (nagasa) = ' + nagasa);
  // console.log('Debug: Target half (mokuhyo) = ' + mokuhyo);


  let half = 0; // Initialize 'half' variable to accumulate the sum of elements for the first partition.
  let i = 0;    /* Initialize 'i' as an index to iterate through the 'kukanInt' array. */

  while (half < mokuhyo) { // Loop continues as long as the accumulated 'half' sum is less than the 'mokuhyo' target.
    half += kukanInt[i];   // Add the integer at the current index 'i' to 'half'.
    i++; // Increment the index 'i' to move to the next element in the array.
  } // The loop terminates when 'half' is no longer strictly less than 'mokuhyo'.


  let ans1 = 0; // Initialize 'ans1', representing the sum of elements for one potential answer.
  let ans2 = 0; /* Initialize 'ans2', representing the sum of elements for another potential answer. */

  for (let j = 0; j < i; j++) { // Loop to calculate 'ans1': sum elements from the beginning up to index 'i' (exclusive).
    ans1 += kukanInt[j];
  }

  for (let j = 0; j <= i; j++) { // Loop to calculate 'ans2': sum elements from the beginning up to index 'i' (inclusive).
    ans2 += kukanInt[j];
  }

  // More debugging lines, also commented out to maintain Type I clone definition.
  // console.log('Debug: Calculated ans1 value: ' + ans1);
  // console.log('Debug: Calculated ans2 value: ' + ans2);


  if (ans1 === half && nagasa - ans1 === half) { // Check for a specific condition: if 'ans1' perfectly splits 'nagasa' into two 'half' segments.
    ans1 = 0; /* If it's a perfect split, the difference (which is what we're ultimately minimizing) is 0. */
  }
  else { // If the above condition is not met.
    ans1 = Math.abs(ans1 - nagasa); // Calculate the absolute difference between 'ans1' and the total sum 'nagasa'.
  }


  if (ans2 === nagasa) { // Special condition: if 'ans2' is equal to the entire total sum 'nagasa'.
    ans2 = Infinity; /* In this specific case, 'ans2' is set to Infinity to effectively rule it out as the minimum difference. */
  }
  else { // For all other scenarios where 'ans2' is not equal to 'nagasa'.
    ans2 = Math.abs(ans2 - nagasa); // Calculate the absolute difference between 'ans2' and the total sum 'nagasa'.
  }


  if (ans1 < ans2) { // Compare the final calculated differences, 'ans1' and 'ans2'.
    console.log(ans1); // If 'ans1' is strictly smaller, output its value.
  }
  else { /* If 'ans2' is less than or equal to 'ans1', output the value of 'ans2'. */
    console.log(ans2);
  }
}; // End of the main function definition.

main(require('fs').readFileSync('/dev/stdin', 'utf8')); // This line calls the 'main' function, providing input by reading a file from standard input '/dev/stdin' as a UTF-8 string.