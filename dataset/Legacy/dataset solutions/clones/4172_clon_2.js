function processInput(inputString) {
  // Parse the input string to get the array of numbers.
  // The first line is usually the count, the second line contains the numbers.
  let numberArray = inputString.split("\n")[1].split(" ");

  // Initialize a counter for the number of divisions.
  let iterationCount = 0;

  // Loop as long as all elements in the array are even numbers.
  while (numberArray.every(elementValue => elementValue % 2 === 0)) {
    // Increment the division counter.
    iterationCount++;
    // Divide each element in the array by 2.
    numberArray = numberArray.map(elementValue => elementValue / 2);
  }

  // Output the final count of divisions.
  console.log(iterationCount);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
