function ProcessInput(rawData) {
  // Trim any leading or trailing whitespace from the raw input string
  rawData = rawData.trim();

  // Extract the array length from the first line of the input
  var arrayLength = parseInt(rawData.split("\n")[0]);

  // Parse the second line into an array of numbers
  var numberSequence = rawData.split("\n")[1].split(" ").map((item) => Number(item));

  // Initialize the string that will be printed as the final result
  var resultString = "Yes";

  // Counters for specific types of numbers in the sequence
  var multiplesOfFour = 0; // Stores the count of numbers divisible by 4
  var multiplesOfTwoOnly = 0; // Stores the count of numbers divisible by 2 but not by 4

  // Iterate through each element in the number sequence
  for (var idx = 0; idx < numberSequence.length; idx++) {
    // Check if the current number is a multiple of 2 but not a multiple of 4
    if (numberSequence[idx] % 2 == 0 && numberSequence[idx] % 4 != 0) {
      multiplesOfTwoOnly++; // Increment the counter for '2-only' multiples
    }
    // Otherwise, check if the current number is a multiple of 4
    else if (numberSequence[idx] % 4 == 0) {
      multiplesOfFour++; // Increment the counter for multiples of 4
    }
  }

  // The problem logic involves checking if a certain condition related to
  // multiples of 2 and 4 is met for the given array length.
  // We need at least Math.floor(arrayLength / 2) "strong" elements (multiples of 4).
  if (Math.floor(arrayLength / 2) > multiplesOfFour) {
    // If there aren't enough multiples of 4, calculate how many more are needed
    var neededFourMultiples = Math.floor(arrayLength / 2) - multiplesOfFour;

    // Each '2-only' multiple can effectively cover half of a 'strong' element requirement.
    // So, 'neededFourMultiples' strong elements would require 'neededFourMultiples * 2' '2-only' multiples.
    if (neededFourMultiples * 2 > multiplesOfTwoOnly) {
      resultString = "No"; // If not enough '2-only' multiples to compensate, the condition is not met
    }
    // else {
    //   // If there are enough '2-only' multiples to compensate, the result remains "Yes".
    // }
  }
  // else {
  //   // If there are already enough or more multiples of 4, the condition is met, and the result remains "Yes".
  // }

  // Print the final determined result to the console
  console.log(resultString);
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
