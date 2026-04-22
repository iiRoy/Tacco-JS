"use strict";

const computeFinalValue = (firstInput, secondInput, thirdInput) => {
  // Phase 1: Interaction between secondInput (b) and thirdInput (c)
  // This calculates the score from the initial interaction and the remaining 'c' component.
  // The original conditional `if(b >= c) { ans += c+b; c = 0; } else { ans += b*2; c -= b, b = 0; }`
  // is transformed into arithmetic expressions using Math.min and Math.max.
  const scoreFromSecondAndThird = Math.min(secondInput, thirdInput) * 2 + Math.max(0, secondInput - thirdInput);
  const remainingThirdAfterFirstPhase = Math.max(0, thirdInput - secondInput);

  // Phase 2: Interaction between the remaining thirdInput (c) and firstInput (a)
  // This accounts for using 'a' to further reduce 'c' and add to the score.
  // Original: `if(c>0) { var tmp = Math.min(c,a); c -= tmp; ans += tmp; }`
  const portionFromFirst = Math.min(remainingThirdAfterFirstPhase, firstInput);
  const scoreAfterSecondPhase = scoreFromSecondAndThird + portionFromFirst;
  const remainingThirdAfterSecondPhase = remainingThirdAfterFirstPhase - portionFromFirst;

  // Phase 3: Final check on the remaining thirdInput (c)
  // This adds 1 to the score if 'c' is still positive.
  // Original: `if(c>0) ans++;`
  // Math.min(1, X) adds 1 if X > 0, and 0 if X <= 0.
  const finalScore = scoreAfterSecondPhase + Math.min(1, remainingThirdAfterSecondPhase);

  return finalScore;
};

const processInputAndOutput = (dataSource) => {
  // Parse the input string into an array of numbers.
  // Using .map(Number) as an alternative to multiple parseInt calls.
  const numericComponents = dataSource.split(" ").map(Number);
  const first = numericComponents[0];  // Corresponds to original 'a'
  const second = numericComponents[1]; // Corresponds to original 'b'
  const third = numericComponents[2];  // Corresponds to original 'c'

  // Compute the final result using the functional calculation.
  const resultValue = computeFinalValue(first, second, third);

  // Display the final computed value.
  console.log(resultValue);
};

// Entry point: Read data from standard input and initiate processing.
processInputAndOutput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));