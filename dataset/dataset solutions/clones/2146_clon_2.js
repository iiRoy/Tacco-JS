function processInput (inputString) {
  // Split the incoming string by spaces to get individual components.
  var stringParts = inputString.split(' ');

  // Evaluate conditions to determine if exactly two of the three parts are identical.
  // First scenario: The first two parts are the same, but different from the third.
  if (stringParts[0] === stringParts[1] && stringParts[0] !== stringParts[2]) {
    console.log('Yes'); // Output 'Yes' if this condition is met.
  }
  // Second scenario: The first and third parts are the same, but different from the second.
  else if (stringParts[0] === stringParts[2] && stringParts[0] !== stringParts[1]) {
    console.log('Yes'); // Output 'Yes' if this condition is met.
  }
  // Third scenario: The second and third parts are the same, but different from the first.
  else if (stringParts[2] === stringParts[1] && stringParts[0] !== stringParts[2]) {
    console.log('Yes'); // Output 'Yes' if this condition is met.
  }
  // If none of the above conditions are true, it means either all are different or all are the same.
  else {
    console.log('No'); // Output 'No' in all other cases.
  }
}

// Read the entire content from standard input, assuming UTF-8 encoding,
// and then pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
