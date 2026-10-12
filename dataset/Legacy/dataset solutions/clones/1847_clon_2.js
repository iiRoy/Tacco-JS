function ProcessInput(rawData) {
  // Convert the raw input data into an array of individual characters.
  const charArray = rawData.toString().split('');
  
  // Determine the last character from the array.
  const finalDigit = charArray[charArray.length - 1];
  
  // Declare a variable to hold the resulting string, initialized as empty.
  let resultString = '';
  
  // Check the value of the last character to assign the appropriate string.
  if (
    finalDigit === "2" ||
    finalDigit === "4" ||
    finalDigit === "5" ||
    finalDigit === "7" ||
    finalDigit === "9"
  ) {
    resultString = "hon"; // Assign "hon" for specific digits.
  } else if (
    finalDigit === "0" ||
    finalDigit === "1" ||
    finalDigit === "6" ||
    finalDigit === "8"
  ) {
    resultString = "pon"; // Assign "pon" for another set of digits.
  } else {
    resultString = "bon"; // Assign "bon" for all other cases.
  }
  
  // Output the final determined string to the console.
  console.log(resultString);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
