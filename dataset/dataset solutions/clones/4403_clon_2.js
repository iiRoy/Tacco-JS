function processInput(rawData) {
  // Initialize an array to hold the two dimensions found.
  let sides = [0, 0];

  // Split the entire input string into individual lines.
  const lines = rawData.split('\n');

  // Extract the second line, which contains space-separated numbers.
  // These numbers are initially strings.
  let numbers = lines[1].split(' ');

  // Sort the array of numbers in descending order.
  // The custom comparator function ensures numerical sorting.
  numbers.sort(function(valA, valB) {
    return valB - valA; // Sorts from largest to smallest.
  });

  // Initialize a counter to track how many sides have been identified.
  let count = 0;

  // Iterate through the sorted array to find two pairs of identical numbers.
  // The loop continues as long as there are elements to check and fewer than two sides found.
  for (let idx = 0; idx < numbers.length - 1 && count < 2; idx++) {
    // Check if the current element is equal to the next element.
    if (numbers[idx] === numbers[idx + 1]) {
      // If a pair is found, store one of the numbers as a side.
      sides[count] = numbers[idx];
      // Increment the loop index to skip the second number of the current pair.
      idx++;
      // Increment the count of found sides.
      count++;
    }
  }

  // The original code had a commented-out debug line here.
  // console.log(numbers);

  // Calculate the product of the two found sides and print it to the console.
  // JavaScript performs implicit type conversion from string to number for multiplication.
  console.log(sides[0] * sides[1]);
}

// Read the entire content from standard input as a UTF-8 string,
// then pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
