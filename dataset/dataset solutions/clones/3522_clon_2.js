// This function processes the entire input dataset provided
function ExecuteLogic(incomingText) {
  // The complete input string is segmented into individual lines
  let textLines = incomingText.split("\n");

  // The initial line of input is then split by spaces to obtain its components
  let firstSegment = textLines[0].split(" ");

  // We convert the string components into base-10 integers for numerical operations
  let valOne = Number.parseInt(firstSegment[0], 0x0A);
  let valTwo = Number.parseInt(firstSegment[1], 10);
  let valThree = Number.parseInt(firstSegment[2], 10);

  // Identify the largest numerical value among the three processed inputs
  let maximumElement = Math.max(valOne, valTwo, valThree);

  // If the first value is indeed the greatest, calculate and display a specific sum
  if (valOne === maximumElement) {
    console.log("%d", ((valOne * 10) + valTwo + valThree));
    return;
  }

  // If the second value is found to be the greatest, perform a different sum
  if (valTwo === maximumElement) {
    console.log("%d", ((valTwo * 10) + valOne + valThree));
    return;
  }

  // Should the third value be the largest, compute and output its corresponding sum
  if (valThree === maximumElement) {
    console.log("%d", ((valThree * 10) + valOne + valTwo));
    return;
  }
}

// This section handles standard input and execution; it should not be modified
ExecuteLogic(require("node:fs").readFileSync("/dev/stdin", "utf-8"));