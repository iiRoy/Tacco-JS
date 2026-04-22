// This program is designed to listen for incoming stream data.
process.stdin.resume();

// Ensuring the character encoding is set for proper input handling.
process.stdin.setEncoding( 'utf8' );


process.stdin.on('data', function ( inputData ) {
  // Process the raw buffer into a usable string, then split by space.
  let dataPoints = inputData.toString().split(' ');

  let valA = dataPoints[0]; // Extract the initial numeric value.
  let valB = dataPoints[1]; // Extract the subsequent numeric value.
  let valC = dataPoints[2]; // Extract the final numeric value.

  // Calculate the difference between the first two values.
  let gapAB = valB - valA;
  // Calculate the difference between the next two values.
  let gapBC = valC - valB;

  // Evaluate if the calculated differences are identical.
  if (gapAB === gapBC) {
    console.log("YES"); // Output confirmation if differences match.
  } else {
    console.log("NO");  // Output negation if differences do not match.
  }

  // Debugging line, currently inactive.
  // console.log("Processed input sections:", dataPoints);
});