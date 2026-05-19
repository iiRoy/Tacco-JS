function ProcessInput(rawData) {
  // Split the incoming string data by spaces to get individual components.
  let parsedValues = rawData.split(' ');

  // Convert the first component to a numerical value, representing the total number of items.
  let totalItems = Number(parsedValues[0]);

  // Convert the second component to a numerical value, representing the effective coverage radius.
  let coverageRadius = Number(parsedValues[1]);

  // Calculate the required number of units.
  // Each unit covers a range of (coverageRadius * 2 + 1) items.
  // We use Math.ceil to ensure all items are covered, even if it's a partial unit.
  console.log(Math.ceil(totalItems / (coverageRadius * 2 + 1)));
}

// Read data from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
