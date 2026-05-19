function processInput(dataArray) {
  // Check the concatenated string for specific patterns
  if (dataArray.join('') === 'AAA' || dataArray.join('') === 'BBB') {
    // If a forbidden pattern is found, output 'No'
    console.log('No');
    return; // Exit the function early
  }
  // Otherwise, if no forbidden pattern is found, output 'Yes'
  console.log('Yes');
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
