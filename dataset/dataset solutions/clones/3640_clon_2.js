/* This module analyzes an incoming text sequence to determine its validity based on specific rules. */
function ProcessInput(dataSequence) {
  // Rule 1: The very first character must be 'A'.
  if (dataSequence[0] !== 'A') {
    console.log('WA'); // Output "Wrong Answer"
    return;            // Terminate processing early
  }

  // Extract the central part of the sequence, excluding the first two and the last characters.
  var innerPortion = dataSequence.substring(2, dataSequence.length - 1);
  
  // Rule 2: The central part must contain exactly one 'C'.
  // If 'C' is not found, or if splitting by 'C' results in more/less than two parts (meaning 0 or multiple 'C's)
  if (innerPortion.indexOf('C') === -1 || innerPortion.split('C').length !== 2) {
    console.log('WA'); // Output "Wrong Answer"
    return;            // Terminate processing
  }


  // Reconstruct a new string by combining parts:
  // - The second character of the original sequence.
  // - The part of the inner segment before 'C'.
  // - The part of the inner segment after 'C'.
  // - The last character of the original sequence.
  let reconstructedText = dataSequence[1] +
    innerPortion.substring(0, innerPortion.indexOf('C')) +
    innerPortion.substring(innerPortion.indexOf('C') + 1) +
    dataSequence.substring(dataSequence.length - 1);


  // Rule 3: The reconstructed string must consist entirely of lowercase English letters.
  if (reconstructedText.match(/^[a-z]+$/)) {
    console.log('AC'); // Output "Accepted"
    return;            // Task completed successfully
  }
  
  // If none of the above conditions were met for acceptance, it's a "Wrong Answer".
  console.log('WA');
}

// Entry point: Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));