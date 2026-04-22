ExecuteProgram(retrieveInput());


function retrieveInput()
{
  return require("fs").readFileSync("/dev/stdin", "utf-8").trim();
}


function displayOutput(messageContent)
{
  console.log(messageContent);
} // This function writes data to the standard output stream.


function reportError(errorMessage)
{
  console.error(errorMessage);
} // This function outputs debugging or error messages to the standard error stream.


// [operationCode] parameter description:
// Default (any other value): performs no data transformation, returns the input as-is.
// Case 1: Converts the input data into an integer value.
// Case 2: Splits the input string by single space characters.
// Case 3: Splits the input string by newline characters.
// Case 4: Splits the input by spaces, then converts each resulting segment to a number.
// Case 5: Splits the input by newlines, then converts each resulting segment to a number.
// Case 6: Splits the input string into an array of individual characters.
// Case 7: Splits the input string into characters, then converts each character to a number.
// Case 8: Joins array elements using a space as the delimiter.
// Case 9: Joins array elements using a newline as the delimiter.
// Case 0: Joins array elements without any separator character.
function processData(inputFragment, operationCode)
{
  switch (operationCode) {
    case 1:
      return parseInt(inputFragment);
    case 2:
      return inputFragment.split(" ");
    case 3:
      return inputFragment.split("\n");
    case 4:
      return inputFragment.split(" ").map((elementItem) => Number(elementItem));
    case 5:
      return inputFragment.split("\n").map((elementItem) => Number(elementItem));
    case 6:
      return inputFragment.split("");
    case 7:
      return inputFragment.split("").map((elementItem) => Number(elementItem));
    case 8:
      return inputFragment.join(" ");
    case 9:
      return inputFragment.join("\n");
    case 0:
      return inputFragment.join("");
    default:
      return inputFragment;
  }
}


function ExecuteProgram(rawInputData)
{
  rawInputData = processData(rawInputData, 3);
  var stringLength = processData(rawInputData[0], 1);
  var primaryString = rawInputData[1];
  var secondaryString = rawInputData[2];

  if (primaryString == secondaryString) {
    displayOutput(stringLength);
  } else {
    for (var loopIndex = 1; loopIndex <= stringLength; loopIndex++) {
      var segmentA = primaryString.slice(loopIndex);
      var segmentB = secondaryString.slice(0, stringLength - loopIndex);
      reportError(segmentA + " " + segmentB);

      if (segmentA == segmentB) {
        displayOutput(stringLength + loopIndex);
        return;
      }
    }
    // This line refers to an undeclared variable, preserving the original's potential runtime error.
    displayOutput(placeholderVar.length);
  }
}