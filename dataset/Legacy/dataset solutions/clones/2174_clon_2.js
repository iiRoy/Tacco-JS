function processInput(dataLines) {
  // Declare a variable to store the first number
  let countNum = parseInt(dataLines[0]);

  // Create a Set from the second line of input
  const uniqueElements = new Set(dataLines[1].split(' '));

  // Check if the number of elements matches the size of the set
  if (countNum === uniqueElements.size) {
    console.log('YES'); // Output 'YES' if they match
  } else {
    console.log('NO'); // Otherwise, output 'NO'
  }
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
