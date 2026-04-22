function CalculateBaseDigits(rawInputString) {
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    console.log(0);
    return;
  }

  const inputTokens = rawInputString.split(' ');

  if (inputTokens.length < 2) {
    console.log(0);
    return;
  }

  let numericValue = parseInt(inputTokens[0], 10);
  let conversionBase = parseInt(inputTokens[1], 10);

  if (isNaN(numericValue) || isNaN(conversionBase)) {
    console.log(0);
    return;
  }

  if (conversionBase <= 1) {
    console.log(0);
    return;
  }

  if (numericValue === 0) {
    console.log(1);
    return;
  }
  
  if (numericValue < 0) {
      console.log(0);
      return;
  }

  let baseDigitCounter = 0;
  let temporaryNumberHolder = numericValue;

  while (temporaryNumberHolder > 0) {
    baseDigitCounter++;
    
    let nextIterationValue = Math.trunc(temporaryNumberHolder / conversionBase);
    temporaryNumberHolder = nextIterationValue;
  }

  console.log(baseDigitCounter);
}

// This block manages the execution environment's interaction for standard I/O.
// It ensures that the primary processing function receives data from standard input
// and is designed to remain unmodified to preserve operational integrity.
CalculateBaseDigits(require("fs").readFileSync("/dev/stdin", "utf8"));