function ProcessInput(rawData) {
  // This function processes the raw input string.
  // It splits the string by spaces to get individual components.
  var parsedValues = rawData.split(" ");

  // Convert the first component to an integer, using base 10.
  var firstNum = parseInt(parsedValues[0], 10);
  // Convert the second component to an integer, using base 10.
  var secondNum = parseInt(parsedValues[1], 10);
  // Convert the third component to an integer, using base 10.
  var thirdNum = parseInt(parsedValues[2], 10);

  // Check if all three numbers are strictly equal.
  if (firstNum === secondNum && secondNum === thirdNum) {
    // If they are all equal, print "Yes" to the console.
    console.log("Yes");
  } else {
    // Otherwise, if they are not all equal, print "No".
    console.log("No");
  }
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
