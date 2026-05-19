function processInput(dataString) {
  // This function checks for the presence of specific characters in the input string.

  // Find the first occurrence of character 'a'
  let idxA = dataString.indexOf("a");

  // Find the first occurrence of character 'b'
  let idxB = dataString.indexOf("b");

  // Find the first occurrence of character 'c'
  let idxC = dataString.indexOf("c");

  // Check if any of the characters were not found (indexOf returns -1 if not present)
  if (idxA === -1 || idxB === -1 || idxC === -1) {
    // If at least one character is missing, output "No"
    console.log("No");
  } else {
    // If all characters ('a', 'b', 'c') are found, output "Yes"
    console.log("Yes");
  }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
