let inputString; // Variable to hold the current line read from input.

// Loop continuously until a line containing only a single dot '.' is encountered.
while ((inputString = readline()) !== '.') {
  let stringLength = inputString.length; // Determine the total character count of the current input line.
  let bracketStack = []; // Initialize an empty array to serve as a stack for tracking opening delimiters.
  let resultMessage = ''; // Initialize a string to store the validation outcome, initially empty.

  // Iterate through each character of the current input string.
  for (let charIndex = 0; charIndex < stringLength; charIndex++) {
    let currentChar = inputString[charIndex]; // Get the character at the current position.

    // Check if the current character is an opening square bracket.
    if (currentChar === '[') {
      bracketStack.push(currentChar); // Add the opening square bracket to the stack.
    }
    // Otherwise, check if it's an opening parenthesis.
    else if (currentChar === '(') {
      bracketStack.push(currentChar); // Add the opening parenthesis to the stack.
    }
    // Otherwise, check if it's a closing square bracket.
    else if (currentChar === ']') {
      // Attempt to pop an item from the stack and verify it's the corresponding opening bracket.
      if (bracketStack.pop() !== '[') {
        resultMessage = 'no'; // If not, set the result to 'no' indicating an imbalance.
        break; // Exit the character loop immediately as the string is already invalid.
      }
    }
    // Otherwise, check if it's a closing parenthesis.
    else if (currentChar === ')') {
      // Attempt to pop an item from the stack and verify it's the corresponding opening parenthesis.
      if (bracketStack.pop() !== '(') {
        resultMessage = 'no'; // If not, set the result to 'no' indicating an imbalance.
        break; // Exit the character loop immediately.
      }
    }
  }

  // After processing all characters or breaking early, evaluate the final state.
  // If resultMessage is still empty (meaning no imbalance was found during iteration)
  // AND the stack is also empty (meaning all opening delimiters were correctly closed).
  if (!resultMessage && bracketStack.length === 0) {
    resultMessage = 'yes'; // The string is balanced.
  } else {
    // Otherwise, if resultMessage was set to 'no' or the stack is not empty, it's unbalanced.
    resultMessage = 'no'; // The string is not balanced.
  }

  print(resultMessage); // Output the final validation result for the current line.
}
