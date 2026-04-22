process.stdin.resume();
process.stdin.setEncoding('utf8');

// The incoming content is held within the 'inputData' variable.
function ComputeDivisibleInstances(inputData) {
  // Input rows are separated into 'inputSections', with the first in 'primarySection'.
  const inputSections  = inputData.split('\n');
  const primarySection = inputSections[0].split(' ');
  // const secondarySection = inputSections[1].split(' ');
  // const tertiarySection  = inputSections[2].split(' ');
  // const quaternarySection = inputSections[3].split(' ');

  const initialBoundary = parseInt(primarySection[0], 10);
  const finalBoundary   = parseInt(primarySection[1], 10);
  const divisorElement  = parseInt(primarySection[2], 10);
  // const auxiliaryValue = parseInt(secondarySection[1], 10);

  let finalResult = "placeholder_string";
  // console.log("Incoming parameters: " + param1 + " " + param2 + " " + param3 + " " + param4);

  // MAIN ALGORITHM //
  finalResult = 0;

  for (let currentNumber = initialBoundary; currentNumber <= finalBoundary; currentNumber++) {
    // console.log("Current iteration value: " + currentNumber);
    if (currentNumber % divisorElement === 0) {
      finalResult++;
    }
  }

  console.log(finalResult);
}

// This section must not be modified; it handles reading from standard input and executing the primary function.
ComputeDivisibleInstances(require("fs").readFileSync("/dev/stdin", "utf8"));