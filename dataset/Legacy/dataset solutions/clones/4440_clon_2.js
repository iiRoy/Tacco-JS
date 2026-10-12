function ProcessInput(rawData) {
  // Normalize line endings and split the raw input string into an array of strings.
  rawData = rawData.replace(/\n/g, ' ');
  rawData = rawData.split(" ");

  // The first element indicates the total number of subsequent integers to process.
  var countOfNumbers = rawData[0];
  // Remove the count from the beginning of the array, leaving only the numbers.
  rawData.shift();

  // Initialize counters for different types of numbers.
  var divisibleByFourCount = 0; // Counts numbers perfectly divisible by 4.
  var divisibleByTwoOnlyCount = 0; // Counts numbers divisible by 2 but not by 4.
  var oddCount = 0; // Counts odd numbers.

  // Initialize the default outcome string.
  var resultString = "No";

  // Iterate through the array of numbers to categorize them.
  for (var idx = 0; idx < countOfNumbers; idx++) {
    // Convert the current string element to a number.
    var currentNum = Number(rawData[idx]);

    // Check divisibility conditions.
    if (currentNum % 4 === 0) {
      divisibleByFourCount++; // Increment count for multiples of 4.
    } else if (currentNum % 2 === 0) {
      divisibleByTwoOnlyCount++; // Increment count for even numbers not divisible by 4.
    } else {
      oddCount++; // Increment count for odd numbers.
    }
  }

  // Determine the final result based on the counts.
  // Condition 1: If the count of odd numbers is less than or equal to the count of multiples of 4.
  if (oddCount <= divisibleByFourCount) {
    resultString = "Yes";
  }
  // Condition 2: If the count of odd numbers is exactly one more than multiples of 4,
  // AND there are no numbers divisible by 2 but not by 4.
  else if (divisibleByFourCount + 1 === oddCount && divisibleByTwoOnlyCount === 0) {
    resultString = "Yes";
  }

  // Output the determined result to the console.
  console.log(resultString);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
