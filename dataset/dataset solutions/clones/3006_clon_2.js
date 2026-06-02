function processInput(rawData) {
  // Divide the incoming data string into separate lines.
  let lines = rawData.split('\n');

  // Extract the number of elements from the first line.
  const countItems = parseInt(lines[0], 10);

  // Parse the second line to get an array of value representations.
  const valueRepresentations = lines[1].split(' ');

  // Parse the third line to get an array of cost representations.
  const costRepresentations = lines[2].split(' ');

  // Initialize a variable to store the cumulative gain.
  let cumulativeGain = 0;

  // Loop through each element based on the count.
  for (let elementIndex = 0; elementIndex < countItems; elementIndex++) {
    // Convert the current element's value string to an integer.
    let currentElementValue = parseInt(valueRepresentations[elementIndex], 10);

    // Convert the current element's cost string to an integer.
    let currentElementCost = parseInt(costRepresentations[elementIndex], 10);

    // If the value is greater than the cost, calculate and add the difference to the gain.
    if (currentElementValue > currentElementCost) {
      cumulativeGain += (currentElementValue - currentElementCost);
    }
  }

  // Display the final calculated cumulative gain.
  console.log(cumulativeGain);
}

// Read the entire content from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
