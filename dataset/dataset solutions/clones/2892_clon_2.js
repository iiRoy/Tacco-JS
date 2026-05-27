function ProcessInput(rawData) {
  // Split the incoming data by newline characters to get an array of lines.
  let processedLines = rawData.split("\n");

  // Extract the first line and convert it into an array of individual characters.
  let charArray = processedLines[0].split("");

  // Initialize a counter to keep track of 'x' occurrences.
  let xCount = 0;

  // Iterate through each character in the character array.
  for (let idx = 0; idx < charArray.length; idx++) {
    // If the current character is 'x', increment the counter.
    if (charArray[idx] === "x") {
      xCount++;
    }
  }

  // Declare a variable to store the ultimate outcome, defaulting to "NO".
  let finalResult = "NO";
  // Check if the count of 'x's is less than or equal to 7.
  if (xCount <= 7) {
    // If the condition is met, change the outcome to "YES".
    finalResult = "YES";
  }

  // Print the final result to the console.
  console.log('%s', finalResult);
  // Return the determined result.
  return finalResult;
}

// This helper function is designed for testing or debugging within a web environment.
function testFunction(testNum) {
  // Retrieve the input string from a specific HTML element identified by its ID.
  let testInputString = document.getElementById("input" + testNum).value;

  // Execute the main processing logic with the retrieved test input.
  let testOutput = ProcessInput(testInputString);

  // Set an initial status for the test.
  let testStatus = "WA"; // Stands for "Wrong Answer"

  // Compare the actual output from ProcessInput with the expected output from another HTML element.
  if (testOutput === document.getElementById("output" + testNum).value.split("\n")[0]) {
    // If the outputs match, update the test status.
    testStatus = "AC"; // Stands for "Accepted"
  }

  // Display the test status in a designated HTML element.
  document.getElementById("result" + testNum).innerHTML = testStatus;
}

// This line executes the primary function, reading input from standard input,
// typically used in a Node.js environment for competitive programming.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
