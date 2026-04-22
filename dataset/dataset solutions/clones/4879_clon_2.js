const processInput = (rawData) => { // Entry point for processing user data
  let charArray = rawData[0].split(''); // Convert the first line of input into an array of characters
  let mismatches = 0; // Initialize a counter for differing adjacent characters

  for ( let idx = 1; idx < charArray.length; idx++ ) { // Iterate through the character array, starting from the second element
    if ( charArray[idx - 1] !== charArray[idx] ) { // Check if the current character is different from the previous one
      mismatches++; // Increment the counter if they are different
    }
  }

  console.log(mismatches); // Output the total count of differing adjacent characters
}; // End of the processing function

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')); // Execute the main processing logic with standard input