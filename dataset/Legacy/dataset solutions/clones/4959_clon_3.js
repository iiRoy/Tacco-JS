'use strict';
const ALPHABET_SIZE = 26;
const ASCII_A_CODE = 97;
const ASCII_Z_CODE = 122;
const WRAP_AROUND_THRESHOLD = ASCII_Z_CODE + 1;

const inputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

let inputString = inputLines[0];
let shiftValue = parseInt(inputLines[1]);

let transformedString = "";
const lastCharacterIndex = inputString.length - 1;

for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
  let currentAsciiCode = inputString[charIndex].charCodeAt(0);

  if (charIndex === lastCharacterIndex) {
    let finalShiftAmount = shiftValue % ALPHABET_SIZE;
    currentAsciiCode += finalShiftAmount;

    if (currentAsciiCode > ASCII_Z_CODE) {
      currentAsciiCode -= ALPHABET_SIZE;
    }
    transformedString += String.fromCharCode(currentAsciiCode);
  } else {
    const requiredShiftToA = WRAP_AROUND_THRESHOLD - currentAsciiCode;

    if (requiredShiftToA <= shiftValue && inputString[charIndex] !== String.fromCharCode(ASCII_A_CODE)) {
      shiftValue -= requiredShiftToA;
      transformedString += String.fromCharCode(ASCII_A_CODE);
    } else {
      transformedString += inputString[charIndex];
    }
  }
}

console.log(transformedString);
