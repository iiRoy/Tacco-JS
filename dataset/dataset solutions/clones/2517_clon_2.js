function processInput (rawData) {
  // Extract the last line from the input string, which is expected to be a number.
  var parsedValue = rawData.split("\n").pop();
  
  // Calculate the count of odd numbers based on the parsed value.
  var oddCount = calculateOddOccurrences(parsedValue);
      
  /**
   * Determines the number of odd integers up to a given number.
   * If the number is even, it's half the number.
   * If the number is odd, it's half the number plus one.
   * @param {string} inputNumber The number as a string.
   * @returns {number} The count of odd numbers.
   */
  function calculateOddOccurrences(inputNumber) {
  	// Check if the input number is even.
  	var isDivisibleByTwo = inputNumber % 2 === 0 ? true : false;
	
    // If the number is even, the count of odd numbers is half of it.
    if(isDivisibleByTwo) {
      return Math.floor(inputNumber / 2);
    } else {
      // If the number is odd, the count of odd numbers is half of it plus one.
      return Math.floor(inputNumber / 2) + 1;
    }
  }
  
  // Calculate the final ratio of odd count to the original number.
  var finalRatio = parseFloat(oddCount / parsedValue);
  
  // Print the result formatted to 11 decimal places, followed by a newline.
  console.log(finalRatio.toFixed(11) + '\n');

}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
