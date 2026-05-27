// This function serves as the primary entry point for processing the problem's input.
function ProcessInput(rawData) {
  // The raw input string is first split into individual lines.
  let processedLines = rawData.split("\n");

  // Extract the dimensions for the two sequences from the first line.
  // 'numA' represents the count of elements in the first sequence.
  let numA = parseInt(processedLines[0].split(" ")[0]);
  // 'numB' represents the count of elements in the second sequence.
  let numB = parseInt(processedLines[0].split(" ")[1]);

  // Parse the first sequence of integers from the second line of input.
  let arrA = processedLines[1].split(" ").map(element => parseInt(element));
  // Parse the second sequence of integers from the third line of input.
  let arrB = processedLines[2].split(" ").map(element => parseInt(element));

  // Define a constant for the modulo operation, commonly used in competitive programming.
  const moduloVal = Math.pow(10, 9) + 7;

  // Initialize a 2D array, 'dynamicProg', which will store intermediate results
  // for the dynamic programming approach. Its size is (numA + 1) x (numB + 1).
  let dynamicProg = new Array(numA + 1).fill(0);

  // Populate the base cases for the 'dynamicProg' table.
  // This loop iterates through each row of the DP table.
  for (let idxA = 0; idxA < numA + 1; idxA++) {
    let tempRow; // A temporary array to construct each row.
    if (idxA === 0) {
      // For the very first row (representing an empty first sequence),
      // all cells are initialized to 1, as an empty sequence can be formed in one way.
      tempRow = new Array(numB + 1).fill(1);
    } else {
      // For subsequent rows, initialize all cells to 0 initially.
      tempRow = new Array(numB + 1).fill(0);
    }
    // The first element of every row is set to 1, signifying that an empty
    // second sequence can always be formed in one way.
    tempRow[0] = 1;
    dynamicProg[idxA] = tempRow; // Assign the constructed row to the DP table.
  }

  // Fill the 'dynamicProg' table using the core dynamic programming logic.
  // This nested loop iterates through the elements of both sequences.
  for (let idxA = 0; idxA < numA; idxA++) {
    for (let idxB = 0; idxB < numB; idxB++) {
      // Check if the current elements from both sequences are identical.
      if (arrA[idxA] === arrB[idxB]) {
        // If they match, the number of common subsequences ending here is the sum of:
        // 1. Subsequences without the current element from arrA (dynamicProg[idxA][idxB + 1])
        // 2. Subsequences without the current element from arrB (dynamicProg[idxA + 1][idxB])
        // The sum effectively counts subsequences ending with the current match,
        // and those that don't use the current match from either sequence.
        dynamicProg[idxA + 1][idxB + 1] = (dynamicProg[idxA][idxB + 1] + dynamicProg[idxA + 1][idxB]) % moduloVal;
      } else {
        // If the elements do not match, the number of common subsequences is calculated by:
        // Summing subsequences from previous states (without current arrA element + without current arrB element)
        // and then subtracting the overlapping count (subsequences without both current elements)
        // to prevent double-counting.
        dynamicProg[idxA + 1][idxB + 1] = (dynamicProg[idxA][idxB + 1] + dynamicProg[idxA + 1][idxB] - dynamicProg[idxA][idxB]) % moduloVal;
      }
      // Ensure the result remains non-negative after the modulo operation, as JavaScript's % can return negative.
      if (dynamicProg[idxA + 1][idxB + 1] < 0) {
          dynamicProg[idxA + 1][idxB + 1] += moduloVal;
      }
    }
  }

  // The final computed answer is located at the bottom-right cell of the DP table.
  let finalResult = dynamicProg[numA][numB];

  // Output the final result to the console.
  console.log('%s', finalResult);
  // Return the calculated answer.
  return finalResult;
}

// This auxiliary function is typically used for local testing or debugging in a browser environment.
function testSolution(testCaseId) {
  // Retrieve the input data for a specific test case from a designated HTML input element.
  let testInputData = document.getElementById("input" + testCaseId).value;
  // Invoke the main processing function with the retrieved test input.
  let computedAnswer = ProcessInput(testInputData);
  // Initialize the outcome of the test as "Wrong Answer".
  let testOutcome = "WA";
  // Compare the computed answer against the expected output, which is also fetched from an HTML element.
  if (computedAnswer == document.getElementById("output" + testCaseId).value.split("\n")[0]) {
    // If the computed answer matches the expected output, update the outcome to "Accepted".
    testOutcome = "AC";
  }
  // Display the final test outcome in a specific HTML element on the page.
  document.getElementById("result" + testCaseId).innerHTML = testOutcome;
}

// This line executes the main processing function, reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
