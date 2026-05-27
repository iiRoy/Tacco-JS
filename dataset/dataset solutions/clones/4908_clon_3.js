'use strict';

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputParts = fileContent.trim().split(" ");

const valA = inputParts[0];
const valB = inputParts[1];
const valC = inputParts[2];

const areAAndBEqual = (valA === valB);
const areBAndCEqual = (valB === valC);
const areAAndCEqual = (valA === valC);

if (areAAndBEqual && areBAndCEqual) {
  console.log(1);
} else if (areAAndBEqual || areBAndCEqual || areAAndCEqual) {
  console.log(2);
} else {
  console.log(3);
}
