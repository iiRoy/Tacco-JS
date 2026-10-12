// This module processes incoming data and generates a specific sequence of pairs.

function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  let processedLines = rawData.split("\n");

  // Parse the first line to get the primary numerical value.
  let countVal = Number.parseInt(processedLines[0]);

  // Initialize an array to store intermediate results before final assembly.
  let resultParts = [];

  // Check if the primary value is an even number.
  if (countVal % 2 === 0) {
    // If even, calculate the initial count based on a specific formula.
    resultParts.push((countVal - 2) * countVal / 2);

    // Iterate through possible first elements for pairs.
    for (let idxA = 1; idxA < countVal + 1; idxA++) {
      // Iterate through possible second elements for pairs, ensuring idxB > idxA.
      for (let idxB = idxA + 1; idxB < countVal + 1; idxB++) {
        // Exclude pairs where the second element is a specific reflection of the first.
        if (idxB !== countVal + 1 - idxA) {
          // Add the valid pair as a string to the results array.
          resultParts.push(idxA + " " + idxB);
        }
      }
    }
  } else {
    // If odd, calculate the initial count using a different formula.
    resultParts.push((countVal - 3) * (countVal - 1) / 2 + (countVal - 1));

    // Iterate through possible first elements for pairs.
    for (let idxA = 1; idxA < countVal + 1; idxA++) {
      // Iterate through possible second elements for pairs, ensuring idxB > idxA.
      for (let idxB = idxA + 1; idxB < countVal + 1; idxB++) {
        // Exclude pairs where the second element is a specific reflection of the first.
        if (idxB !== countVal - idxA) {
          // Add the valid pair as a string to the results array.
          resultParts.push(idxA + " " + idxB);
        }
      }
    }
  }

  // Join all collected parts into a single string, separated by newlines.
  let finalOutput = resultParts.join("\n");

  // Output the final string to the console.
  console.log('%s', finalOutput);

  // Return the generated output string.
  return finalOutput;
}

// This function is for local testing purposes, simulating a web environment.
function testFunction(testNum) {
  // Retrieve input data from a simulated DOM element.
  let testInput = document.getElementById("input" + testNum).value;

  // Process the input using the main logic.
  let processedResult = ProcessInput(testInput);

  // Initialize the test outcome as "Wrong Answer".
  let testOutcome = "WA";

  // Compare the generated result with the expected output from a simulated DOM element.
  if (processedResult === document.getElementById("output" + testNum).value.split("\n")[0]) {
    // If they match, set the outcome to "Accepted".
    testOutcome = "AC";
  }

  // Display the test outcome in a simulated DOM element.
  document.getElementById("result" + testNum).innerHTML = testOutcome;
}

// Execute the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
