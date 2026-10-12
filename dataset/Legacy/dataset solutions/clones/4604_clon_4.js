"use strict";

function computeGreatestCommonDivisor(valX, valY) {
  let absoluteX = Math.abs(valX);
  let absoluteY = Math.abs(valY);

  while (absoluteY) {
    [absoluteX, absoluteY] = [absoluteY, absoluteX % absoluteY];
  }
  return absoluteX;
}

function Main(input) {
  const parts = input.split(" ");
  const firstOperand = parseInt(parts[0], 10);
  const modulusDivisor = parseInt(parts[1], 10);
  const targetRemainder = parseInt(parts[2], 10);

  if (modulusDivisor === 0) {
    console.log("NO");
    return;
  }

  const effectiveCoefficient = firstOperand % modulusDivisor;

  const commonFactor = computeGreatestCommonDivisor(effectiveCoefficient, modulusDivisor);

  if (targetRemainder % commonFactor === 0) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
