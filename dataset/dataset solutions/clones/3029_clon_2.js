var processInput = (inputString) => {
  // Split the incoming string by spaces to get an array of string representations of numbers.
  var numberArray = inputString.split(" ");

  // Iterate over the array and convert each string element into an integer, using base 10.
  numberArray = numberArray.map((currentValue) => {
    return parseInt(currentValue, 10);
  });

  // Evaluate the conditions to determine the output.
  // The first condition checks if the third number is strictly between the first and second in ascending order.
  if (numberArray[0] < numberArray[2] && numberArray[2] < numberArray[1]) {
    console.log("Yes");
  }
  // The second condition checks if the third number is strictly between the first and second in descending order.
  else if (numberArray[0] > numberArray[2] && numberArray[2] > numberArray[1]) {
    console.log("Yes");
  }
  // If neither of the above conditions is met, output "No".
  else {
    console.log("No");
  }
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
