function obtainSource() {
  return require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();
}

function presentResult(outputValue) {
  console.log(outputValue);
} // This function prints the final computation result to the standard output stream.

function recordFailure(outputValue) {
  console.error(outputValue);
} // This function outputs error messages or diagnostic information to the standard error stream.

// This versatile conversion utility provides various methods for transforming input strings.
// The 'transformationMode' parameter defines the specific type of transformation to be applied:
//  Mode 0:  The input string is returned without any modifications.
//  Mode 1:  The input string is converted into an integer value.
//  Mode 2:  The input string is broken into an array of substrings using spaces as delimiters.
//  Mode 3:  The input string is divided into an array of substrings based on newline characters.
//  Mode 4:  The input is first split by spaces, and then each resulting substring is converted to a numerical type.
//  Mode 5:  The input is initially split by newlines, and subsequently, each part is converted into a number.
//  Mode 6:  The input string is disaggregated into an array where each element is a single character.
//  Mode 7:  The input string is split into individual characters, and then each character is transformed into its numerical representation.
function transformContent(sourceString, transformationMode) {
  switch (transformationMode) {
    case 0:
      return sourceString;
    case 1:
      return parseInt(sourceString);
    case 2:
      return sourceString.split(" ");
    case 3:
      return sourceString.split("\n");
    case 4:
      return sourceString.split(" ").map((strItem) => Number(strItem));
    case 5:
      return sourceString.split("\n").map((strItem) => Number(strItem));
    case 6:
      return sourceString.split("");
    case 7:
      return sourceString.split("").map((strItem) => Number(strItem));
  }
}

function RunProcessor(initialDataSet) {
  var processedDataSet = transformContent(initialDataSet, 4);

  var rangeStart = processedDataSet[0];
  var rangeEnd = processedDataSet[1];

  var palindromeTally = 0;

  for (var currentNumber = rangeStart; currentNumber <= rangeEnd; currentNumber++) {
    var digitCharacters = transformContent(currentNumber.toString(), 6);
    if (
      digitCharacters[0] == digitCharacters[4] &&
      digitCharacters[1] == digitCharacters[3]
    ) {
      palindromeTally++;
    }
  }

  presentResult(palindromeTally);
}

RunProcessor(obtainSource());