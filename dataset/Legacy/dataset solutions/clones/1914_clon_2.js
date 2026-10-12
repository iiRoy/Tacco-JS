function processInput(rawData) {
  // Divide the incoming text into individual lines for processing.
  const parsedLines = rawData.split('\x0A');

  // Extract the key numerical value from the initial line.
  const divisorValue = Number(parsedLines[0]);

  // Parse the second line to obtain the lower and upper bounds of the interval.
  const [startRange, endRange] = parsedLines[1].split(' ').map(Number);

  // Traverse through each integer within the defined numerical span.
  for (let currentNumber = startRange; currentNumber <= endRange; currentNumber++) {
    // Evaluate if the present integer is perfectly divisible by our key value.
    if (currentNumber % divisorValue === 0) {
      // If a match is found, signal success and exit the routine.
      console.log('OK');
      return;
    }
  }

  // Should the loop complete without finding any divisible number, indicate failure.
  console.log('NG');
}

// Acquire the program's input from the standard input stream,
// decode it as UTF-8, remove any extraneous whitespace,
// and then initiate the primary processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
