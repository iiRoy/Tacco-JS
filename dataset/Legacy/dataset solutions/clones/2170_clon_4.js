"use strict";
main(
  require("fs")
    .readFileSync("/dev/stdin", "UTF-8")
    .trim()
    .split("\n")
);

function main(sourceLines) {
  const firstLineCharacterCount = sourceLines[0].length;
  const outputPattern = new Array(firstLineCharacterCount + 1).join('x');
  console.log(outputPattern);
}
