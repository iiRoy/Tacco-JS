function primaryProcess(rawContent) {
  /*
   * This function processes the entire input string.
   * It is expected that the input might need to be
   * split into individual lines for further handling.
   */

  const receivedLines = rawContent.split("\n");

  const firstEntryElements = receivedLines[0].split(" ");
  const secondEntryComponents = receivedLines[1].split(' ');


  console.log(firstEntryElements);
  console.log(secondEntryComponents);

  const numericValues = secondEntryComponents;

  const totalSummation = numericValues.reduce(function (currentVal, nextVal) {
    return currentVal + nextVal;
  });

  if (totalSummation > firstEntryElements[0]) {
    console.log("Yes");
  } else {
    console.log("No");
  }
} // End of primaryProcess function definition.

// The following invocation ensures the program runs with standard input.
primaryProcess(require("fs").readFileSync("/dev/stdin", "utf8"));