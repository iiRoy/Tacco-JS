function ProcessInput(rawData) {
  // Deconstruct the incoming string into two distinct numeric components.
  let [firstOperand, secondOperand] = rawData.split(" ");

  const resultContainer = []; // Initialize an array to store computed values.

  // Perform various arithmetic operations and append the outcomes to the container.
  resultContainer.push(Number(firstOperand) + Number(secondOperand));
  resultContainer.push(Number(firstOperand) - Number(secondOperand));
  resultContainer.push(Number(firstOperand) * Number(secondOperand));
}

// The subsequent line is responsible for reading standard input and invoking the primary processing function.
// It must remain unaltered to ensure correct execution within the designated environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
