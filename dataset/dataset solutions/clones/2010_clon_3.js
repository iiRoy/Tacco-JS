function parsePosition(source) {
  const parsedValue = Number(source.trim());

  // केवल गैर-ऋणात्मक पूर्णांक स्वीकार करता है।
  if (
    Number.isInteger(parsedValue) &&
    parsedValue >= 0
  ) {
    return parsedValue;
  }

  return null;
}

function generateFibonacciState(totalSteps) {
  let state = [0n, 1n];
  let remainingSteps = totalSteps;

  // वर्तमान और अगली संख्या को एक साथ सुरक्षित रखता है।
  while (remainingSteps > 0) {
    const updatedState = [
      state[1],
      state[0] + state[1]
    ];

    state = updatedState;
    remainingSteps -= 1;
  }

  return state;
}

function obtainFibonacciNumber(position) {
  const finalState = generateFibonacciState(position);

  return finalState[0];
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const validPosition = parsePosition(source);

let output;

if (validPosition === null) {
  output = "INVALID";
} else {
  const fibonacciNumber =
    obtainFibonacciNumber(validPosition);

  output = fibonacciNumber.toString();
}

// तैयार पाठ को मानक आउटपुट पर लिखता है।
process.stdout.write(output + "\n");