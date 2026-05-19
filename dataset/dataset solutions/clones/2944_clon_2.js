'use strict';

(function (rawData) {
  // Process the raw input string: trim, split by whitespace, and convert to numbers.
  let processedData = rawData.trim().split(/\s+/).map(numStr => numStr - 0);

  const valA = Math.min(processedData[0], processedData[1]);
  const valB = Math.max(processedData[0], processedData[1]);
  const valC = processedData[2];

  // Define the large prime modulus for calculations.
  const modulus = Math.pow(10, 9) + 7;

  let finalResult = 0;

  // First iteration block: for iterVar from 1 up to valA - 1
  for (let iterVar = 1; iterVar <= valA - 1; iterVar++) {
    let termOne = (1 / 6) * (iterVar + 1) * (iterVar + 2) * (iterVar * 3);
    let termTwo = ((valA - iterVar - 1) + (valB - iterVar - 1)) * (1 / 2) * (iterVar + 1) * (iterVar + 2);
    let termThree = (valA - iterVar - 1) * (valB - iterVar - 1) * (iterVar + 1);
    let termFour = (valA - iterVar) + (valB - iterVar);

    finalResult += iterVar * ((termOne + termTwo + termThree) * 2 - termFour);
    finalResult %= modulus;
  }

  // Second iteration block: for iterVar from valA up to valB - 1
  for (let iterVar = valA; iterVar <= valB - 1; iterVar++) {
    let termOne = (1 / 6) * (valA) * (valA + 1) * (valA + 2);
    let termTwo = (valB - iterVar - 1) * (1 / 2) * (valA) * (valA + 1);
    let termThree = 0; // This term is zero in this range
    let termFour = (valB - iterVar);

    finalResult += iterVar * ((termOne + termTwo + termThree) * 2 - termFour);
    finalResult %= modulus;
  }

  // Third iteration block: for iterVar from valB up to valA + valB - 2
  for (let iterVar = valB; iterVar <= valA + valB - 2; iterVar++) {
    let tempVal = valA + valB - 1 - iterVar;
    let termOne = (1 / 6) * (tempVal) * (tempVal + 1) * (tempVal + 2);
    let termTwo = 0; // These terms are zero in this range
    let termThree = 0;
    let termFour = 0;

    finalResult += iterVar * ((termOne + termTwo + termThree) * 2 - termFour);
    finalResult %= modulus;
  }

  // Multiply finalResult by (valA * valB - 2) C (valC - 2)
  for (let loopIdx = 0; loopIdx < valC - 2; loopIdx++) {
    finalResult *= (valA * valB - 2 - loopIdx);
    finalResult %= modulus;

    // Modular inverse calculation using Extended Euclidean Algorithm
    // This effectively performs division in modular arithmetic.
    let remainderSeq = [modulus, loopIdx + 1];
    let quotientSeq = [];

    while (remainderSeq[remainderSeq.length - 1] !== 1) {
      let dividend = remainderSeq[remainderSeq.length - 2];
      let divisor = remainderSeq[remainderSeq.length - 1];
      let currentRemainder = dividend % divisor;
      let currentQuotient = Math.floor(dividend / divisor); // Integer division

      remainderSeq.push(currentRemainder);
      quotientSeq.push(currentQuotient);
    }

    let coefficientSeq = [-quotientSeq.pop(), 1]; // Initialize coefficients for the last two remainders

    while (quotientSeq.length > 0) {
      coefficientSeq.push(coefficientSeq[coefficientSeq.length - 2] - coefficientSeq[coefficientSeq.length - 1] * quotientSeq.pop());
    }

    // Apply the modular inverse to finalResult
    finalResult = (coefficientSeq[coefficientSeq.length - 2] * finalResult) % modulus;
  }

  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
