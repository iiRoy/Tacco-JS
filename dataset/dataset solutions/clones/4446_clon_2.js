function ProcessInput(rawData) {
  // Split the incoming raw data string into individual lines.
  let lines = rawData.split('\n');

  // Extract the second line, split it by spaces, and convert each part to a number.
  const numericArray = lines[1].split(' ').map(Number);

  // Initialize a counter for numbers divisible by 2 but not 4.
  let countOfTwos = 0;
  // Initialize a counter for numbers divisible by 4.
  let countOfFours = 0;

  // Iterate over each element in the numeric array.
  numericArray.forEach(function(currentValue) {
    // Check if the current value is a multiple of 4.
    if (currentValue % 4 === 0) {
      countOfFours++; // Increment the count for multiples of 4.
    }
    // Otherwise, check if it's a multiple of 2 (and thus not 4, due to the previous check).
    else if (currentValue % 2 === 0) {
      countOfTwos++; // Increment the count for multiples of 2.
    }
  });

  // Decrement the count of twos by two.
  countOfTwos -= 2;
  // Ensure the count of twos does not fall below zero.
  countOfTwos = Math.max(countOfTwos, 0);

  // Determine the total number of elements in the array.
  const arrayLength = numericArray.length;

  // Output "Yes" or "No" based on the calculated condition.
  console.log(countOfFours * 3 + countOfTwos >= arrayLength ? "Yes" : "No");
}

// Read the entire content from standard input, remove leading/trailing whitespace, and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
