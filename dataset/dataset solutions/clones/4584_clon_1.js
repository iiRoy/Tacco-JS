"use strict"; /* This directive enables strict mode, which helps catch common coding errors and "unsafe" actions. */

// Define the main function that processes the input argument.
const main = arg => {

  // Trim leading/trailing whitespace from the input and split it into an array of lines.
  arg = arg.trim().split("\n");

  // Parse the first line of input to get N and K.
  // N represents the number of data entries that follow.
  const N = parseInt( arg[0].split(" ")[0] );
  // K is the target sum value we are looking for.
  const K = parseInt( arg[0].split(" ")[1] );

  // Extract the lines containing number-amount pairs, from the second line up to N lines.
  const numbers = arg.slice( 1, N + 1 );

  // Initialize an empty array to store objects, each representing a number-amount pair.
  const map = [];

  // Iterate through each string in the 'numbers' array using a for...in loop.
  for ( let i in numbers ) {

    // Split the current string by space and convert both parts to integers.
    let temp = numbers[i].split(" ").map( n => parseInt( n ) );

    // Extract the actual number and its associated amount from the temporary array.
    let number = temp[0];
    let amount = temp[1];

    // Push a new object with 'number' and 'amount' properties into the 'map' array.
    map.push( { number: number, amount: amount } );
  }

  // The following line was commented out in the original code.
  // It remains commented to preserve the exact logical flow.
  // map.sort((a,b)=>a.number - b.number);

  // Initialize a variable to accumulate the sum of amounts.
  let sum = 0;
  // Initialize an index variable for iterating through the 'map' array.
  let i = 0;

  // Loop while the accumulated sum is less than the target value K.
  while ( sum < K ) {

    // Add the amount of the current item in 'map' to the sum.
    sum += map[i].amount;
    // Increment the index to move to the next item.
    i++;
  }

  // After the loop, 'i' will be one position beyond the item that made the sum reach or exceed K.
  // So, we access the number of the previous item (map[i - 1]).
  // Print this number to the console.
  console.log( map[i - 1].number );
};

// Read input from standard input (/dev/stdin) using Node.js 'fs' module
// and pass it to the main function.
main( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );