const processInput = (inputString) => {
  const parseNumericValue = (text) => {
    // Explicitly specify radix 10 for parseInt, a good practice that doesn't alter behavior for decimal inputs.
    return parseInt(text, 10);
  };

  const getConditionalResult = (value) => {
    // Rewrite the ternary operator (value ? 0 : 1) using an if-else structure.
    let outcome;
    if (value) {
      outcome = 0;
    } else {
      outcome = 1;
    }
    return outcome;
  };

  const numericData = parseNumericValue(inputString);
  const finalOutputValue = getConditionalResult(numericData);
  console.log(finalOutputValue);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
