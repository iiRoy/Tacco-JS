function processInput(dataLines) {
  // Extract the first line of input, which contains two space-separated numbers.
  let firstNum = +dataLines[0].split(" ")[0]; // Convert the first part to a numeric value.
  let secondNum = +dataLines[0].split(" ")[1]; // Convert the second part to a numeric value.

  // Calculate three different expressions using the two numbers.
  let sumResult = firstNum + secondNum;
  let differenceResult = firstNum - secondNum;
  let productResult = firstNum * secondNum;

  // Determine the maximum value among the three calculated results.
  // The inner Math.max finds the maximum of differenceResult.
  // The outer Math.max then compares sumResult, differenceResult (from inner max), and productResult.
  console.log(Math.max(sumResult, Math.max(differenceResult), productResult));
}

// Read input from standard input, process it, and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
