function getInputData() {
  // This function is responsible for reading raw input from the standard input stream.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(messageContent) {
  // Outputs the provided message to the standard console output.
  console.log(messageContent);
}

function logError(messageContent) {
  // Writes an error message to the standard error stream.
  console.error(messageContent);
}

// This utility function handles various input parsing and conversion scenarios.
// The 'conversionType' parameter dictates the specific transformation to apply:
// 0: Returns the input string without any modification.
// 1: Parses the input string into an integer.
// 2: Splits the input string by single spaces into an array of strings.
// 3: Splits the input string by newline characters into an array of strings.
// 4: Splits by spaces, then converts each resulting string element to a number.
// 5: Splits by newlines, then converts each resulting string element to a number.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters, then converts each character to a number.
function processInput(rawData, conversionType) {
  switch (conversionType) {
    case 0:
      return rawData;
    case 1:
      return parseInt(rawData);
    case 2:
      return rawData.split(" ");
    case 3:
      return rawData.split("\n");
    case 4:
      return rawData.split(" ").map((itemValue) => Number(itemValue));
    case 5:
      return rawData.split("\n").map((itemValue) => Number(itemValue));
    case 6:
      return rawData.split("");
    case 7:
      return rawData.split("").map((itemValue) => Number(itemValue));
  }
}

function ExecuteLogic(initialData) {
  // First, process the input string into a sorted array of numbers.
  initialData = processInput(initialData, 4).sort(function(valA, valB) {
    return valA - valB;
  });

  // The core logic aims to make three numbers equal by repeatedly incrementing two of them.
  // The strategy involves two main steps:
  // 1. Ensure all three numbers have the same parity (all even or all odd).
  //    If parities are not all the same, exactly two numbers must share a parity.
  //    Incrementing these two numbers by one makes their parities change,
  //    thus aligning all three parities. This counts as one operation.
  // 2. Once parities are consistent, repeatedly increment two numbers until all three are equal
  //    to the maximum value among them. Each such operation reduces the difference
  //    between the maximum and the smaller numbers by two.

  var firstNum = initialData[0];
  var secondNum = initialData[1];
  var thirdNum = initialData[2];
  var finalCount = 0; // This variable will store the total number of operations.

  // Check if the parities of all three numbers are identical.
  // If they are not all the same, an initial adjustment is required.
  if (!(firstNum % 2 === secondNum % 2 && firstNum % 2 === thirdNum % 2 && thirdNum % 2 === secondNum % 2)) {
    // Identify the pair with matching parity and increment them.
    if (firstNum % 2 === secondNum % 2) {
      firstNum++;
      secondNum++;
    } else if (firstNum % 2 === thirdNum % 2) {
      firstNum++;
      thirdNum++;
    } else if (thirdNum % 2 === secondNum % 2) {
      secondNum++;
      thirdNum++;
    }
    // One operation has been performed to align parities.
    finalCount++;
  }

  // At this point, all three numbers have consistent parities.
  // Now, calculate the operations needed to make them all equal to the maximum.
  // Each operation (incrementing two numbers) effectively reduces the 'gap' by 2.
  let currentMax = Math.max.apply(null, [firstNum, secondNum, thirdNum]);
  finalCount += (currentMax - firstNum) / 2;
  finalCount += (currentMax - secondNum) / 2;
  finalCount += (currentMax - thirdNum) / 2;

  displayResult(finalCount);
}

// The program's execution begins here:
// It first retrieves the input data and then passes it to the main logic function.
ExecuteLogic(getInputData());
