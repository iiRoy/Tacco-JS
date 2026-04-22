'use strict'

function acquireText() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function emitValue(res) {
  console.log(res);
} // Writes the final outcome to the console.

/*
 * This utility function converts input strings based on a specific mode.
 * Mode definitions:
 *   0: Returns the input string as-is.
 *   1: Converts the string to an integer.
 *   2: Splits the string by space characters.
 *   3: Splits the string by newline characters.
 *   4: Splits by space, then converts each part to a number.
 *   5: Splits by newline, then converts each part to a number.
 *   6: Splits the string into individual characters.
 *   7: Splits into individual characters, then converts each to a number.
 */
function parseContent(sourceText, conversionType) {
  switch (conversionType) {
    case 0:
      return sourceText;
    case 1:
      return Number.parseInt(sourceText);
    case 2:
      return sourceText.split(" ");
    case 3:
      return sourceText.split("\n");
    case 4:
      return sourceText.split(" ").map((element) => Number(element));
    case 5:
      return sourceText.split("\n").map((item) => Number(item));
    case 6:
      return sourceText.split("");
    case 7:
      return sourceText.split("").map((char) => Number(char));
  }
}

function ExecuteProgram(initialInput) {
  initialInput = parseContent(initialInput, 3);
  initialInput.shift();

  let finalSum = 0;

  for (let counter = 0; counter < initialInput.length; counter++) {
    let valX = Number.parseInt(initialInput[counter].split(" ")[0]);
    let valY = Number.parseInt(initialInput[counter].split(" ")[1]);

    if (valX < valY) {
      finalSum += valY;
    }
  }

  emitValue(finalSum);
}

ExecuteProgram(acquireText());