function ProcessInputString(rawInput) {
  // Extract the first line from the input and convert it into an array of individual characters.
  let inputChars = rawInput.split('\n')[0].split('');

  // Determine if the length of the character array is an even number.
  if (inputChars.length % 2 === 0) {
    // For strings with an even number of characters, define two specific prefixes.
    // The first prefix includes characters from the start up to (length / 2 - 1).
    let firstPrefix = inputChars.slice(0, inputChars.length / 2 - 1);
    // The second prefix includes characters from the start up to (length / 2).
    let secondPrefix = inputChars.slice(0, inputChars.length / 2);

    // Convert these character arrays into Set objects to easily count unique characters.
    firstPrefix = new Set(firstPrefix);
    secondPrefix = new Set(secondPrefix);

    // If both prefixes contain only one unique character each, then output "NO".
    if (firstPrefix.size === 1 && secondPrefix.size === 1) {
      console.log("NO");
      return; // Terminate function execution.
    }
  }
  // If the length of the character array is an odd number.
  else {
    // For strings with an odd number of characters, define two segments, excluding the middle character.
    // The left segment includes characters from the start up to ((length - 1) / 2).
    let leftSegment = inputChars.slice(0, ((inputChars.length - 1) / 2));
    // The right segment includes characters from (((length - 1) / 2) + 1) to the end.
    let rightSegment = inputChars.slice(((inputChars.length - 1) / 2) + 1);

    // Convert these character arrays into Set objects to easily count unique characters.
    leftSegment = new Set(leftSegment);
    rightSegment = new Set(rightSegment);

    // If both segments contain only one unique character each, then output "NO".
    if (leftSegment.size === 1 && rightSegment.size === 1) {
      console.log("NO");
      return; // Terminate function execution.
    }
  }

  // If none of the conditions for outputting "NO" were met, then output "YES".
  console.log("YES");
  return; // Explicitly return from the function.
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInputString(require('fs').readFileSync('/dev/stdin', 'utf8'));
