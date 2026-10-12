process.stdin.setEncoding('utf-8'); // Configure standard input for UTF-8 character encoding.

process.stdin.on('data', (incomingData) => {
  // This callback executes when data is received from standard input.
  var dataParts = incomingData.split(' '); // Split the input string by spaces into an array of strings.

  var radiusValue = parseInt(dataParts[0]); // Parse the first part of the input as an integer to get the radius.

  // Calculate the area of the circle using the formula A = π * r^2.
  var areaResult = radiusValue * radiusValue * Math.PI;

  // Calculate the circumference of the circle using the formula C = 2 * π * r.
  var circumferenceResult = 2 * radiusValue * Math.PI;

  // Format the results to 5 decimal places and concatenate them into a single string.
  var finalOutputString = areaResult.toFixed(5) + ' ' + circumferenceResult.toFixed(5);

  console.log(finalOutputString); // Print the formatted output string to the console.
});
