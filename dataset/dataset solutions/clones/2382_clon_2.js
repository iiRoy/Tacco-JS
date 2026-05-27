function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  rawData = rawData.split("\n");

  // Parse the first line for time-related values.
  var timeValues = rawData[0].split(" ");
  // Parse the second line for alpha-related values.
  var alphaValues = rawData[1].split(" ");
  // Parse the third line for beta-related values.
  var betaValues = rawData[2].split(" ");

  // Extract specific time components.
  var firstTime = timeValues[0];
  var secondTime = timeValues[1];

  // Extract specific alpha components.
  var alphaInitial = alphaValues[0];
  var alphaFinal = alphaValues[1];

  // Extract specific beta components.
  var betaInitial = betaValues[0];
  var betaFinal = betaValues[1];

  // Calculate the first primary term.
  var numeratorTerm = firstTime * (alphaInitial - betaInitial);
  // Calculate the second primary term, incorporating the first.
  var denominatorTerm = (secondTime * alphaFinal + numeratorTerm) - (secondTime * betaFinal);

  // Evaluate conditions based on the signs of the calculated terms.
  if (Math.sign(numeratorTerm) == Math.sign(denominatorTerm)) {
    // If signs are the same, output 0.
    console.log(0);
  } else if (denominatorTerm == 0) {
    // If the denominator term is zero, output "infinity".
    console.log("infinity");
  } else {
    // Otherwise, proceed with further calculations.
    // Take the absolute values of both terms.
    numeratorTerm = Math.abs(numeratorTerm);
    denominatorTerm = Math.abs(denominatorTerm);

    // Check if the absolute numerator is perfectly divisible by the absolute denominator.
    if (numeratorTerm % denominatorTerm == 0) {
      // If divisible, output the result of (numerator / denominator) * 2.
      console.log((numeratorTerm / denominatorTerm) * 2);
    } else {
      // If not divisible, output the result of (ceil(numerator / denominator) * 2) - 1.
      console.log(Math.ceil(numeratorTerm / denominatorTerm) * 2 - 1);
    }
  }
}

// Invoke the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
