function processInputData(rawData) {
  let processedLines = rawData.split("\n");
  const itemCount = parseInt(processedLines[0], 10);
  processedLines.shift();

  // This splice ensures that only the relevant 'itemCount' lines of data are considered,
  // removing any potential extra lines beyond what 'itemCount' specifies.
  processedLines.splice(itemCount, processedLines.length);

  // An intermediate step to parse all data lines into structured arrays of numbers.
  const parsedDataRows = processedLines.map(currentLine => {
    const lineParts = currentLine.split(" ");
    const firstNum = parseInt(lineParts[0], 10);
    const secondNum = parseInt(lineParts[1], 10);
    return [firstNum, secondNum];
  });

  // Extract the first numerical values from each row and sort them in ascending order.
  const firstValuesSorted = parsedDataRows.map(row => row[0]).sort((a, b) => a - b);

  // Extract the second numerical values from each row and sort them in descending order.
  // Using a custom comparator for descending sort is a Type III modification.
  const secondValuesSortedDesc = parsedDataRows.map(row => row[1]).sort((a, b) => b - a);

  let finalResult;

  // The calculation logic depends on whether the total item count is even or odd.
  if (itemCount % 2 === 0) {
    // For an even number of items, we consider the element at (N/2 - 1) index.
    const lowerMidIndex = (itemCount / 2) - 1;
    const valFromA = firstValuesSorted[lowerMidIndex];
    const valFromB = secondValuesSortedDesc[lowerMidIndex];
    finalResult = (valFromB - valFromA) * 2 - 1;
  } else {
    // For an odd number of items, we consider the element at Math.floor(N/2) index.
    const exactMidIndex = Math.floor(itemCount / 2);
    const valFromA = firstValuesSorted[exactMidIndex];
    const valFromB = secondValuesSortedDesc[exactMidIndex];
    finalResult = (valFromB - valFromA) + 1;
  }

  // Output the computed result to the console. Explicit String conversion for clarity.
  console.log(String(finalResult));
  return finalResult;
}

function testSolution(testCaseIndex) {
  const testInputContent = document.getElementById("input" + testCaseIndex).value;
  const computedAnswer = processInputData(testInputContent);
  let testOutcome = "WA"; // Default outcome is "Wrong Answer"

  const expectedOutputContent = document.getElementById("output" + testCaseIndex).value.split("\n")[0];

  // Compare the computed answer (converted to string) with the expected output.
  if (String(computedAnswer) === expectedOutputContent) {
    testOutcome = "AC"; // "Accepted" if they match
  }
  document.getElementById("result" + testCaseIndex).innerHTML = testOutcome;
}

// Execute the main processing function with input read from stdin.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
