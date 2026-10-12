// This script processes some incoming data.
function ProcessInput(dataPayload) {
  // Evaluate the first element of the data payload.
  switch (dataPayload[0]) {
    case 'Sunny':
      // If the weather is sunny, the next state is cloudy.
      process.stdout.write('Cloudy');
      break;
    case 'Cloudy':
      // If the weather is cloudy, the next state is rainy.
      process.stdout.write('Rainy');
      break;
    case 'Rainy':
      // If the weather is rainy, the next state is sunny.
      process.stdout.write('Sunny');
      break;
  }
}

// Do not modify the following lines; they handle standard input/output and invoke the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
