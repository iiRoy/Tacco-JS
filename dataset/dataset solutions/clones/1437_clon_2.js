process.stdin.on(
  "data",
  function (inputDataChunk, encodingParameter) {
    // Convert the incoming data chunk to a string, remove leading/trailing whitespace,
    // and then split it into an array of string values based on spaces.
    let stringComponents = (inputDataChunk + '').trim().split(' ');

    // Calculate the square of the sum of the first and third components.
    let firstCoordinateSquared = Math.pow(stringComponents[0] + stringComponents[2], 2);

    // Calculate the square of the sum of the second and fourth components.
    let secondCoordinateSquared = Math.pow(stringComponents[1] + stringComponents[3], 2);

    // Compute the square root of the sum of the two squared values.
    let finalCalculatedValue = Math.sqrt(firstCoordinateSquared + secondCoordinateSquared);

    // Print the final result to the console, formatted to exactly eight decimal places.
    console.log(finalCalculatedValue.toFixed(8));
  }
).resume(); // Keep the standard input stream open to receive more data.
