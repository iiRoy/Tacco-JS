// This module implements a validation routine for a sequence of specific movements.
function verifyMovementSequence(inputSteps) {

  // Defines the set of permissible movements for elements at odd positions (1st, 3rd, etc.).
  const primaryAllowedMoves = ['R', 'U', 'D'];
  // Defines the set of permissible movements for elements at even positions (2nd, 4th, etc.).
  const secondaryAllowedMoves = ['L', 'U', 'D'];

  if (  inputSteps.length  ===  1  )  {
    if  (inputSteps  ===  'L')
      return  'Invalid';
  }

  // Iterate through the input sequence starting from the second element (index 1).
  for ( let  positionIndex  =  1;  positionIndex  <  inputSteps.length;  positionIndex++  )  {
    // Determine if the current position index is odd.
    if  (  positionIndex  %  2  ===  1  )  {
      // Handle processing for steps appearing at odd positions.
      if  (  primaryAllowedMoves.includes(inputSteps[positionIndex - 1])  )  {
        continue; // Move to the next step if the movement is allowed.
      }
      else  {
        return  'Invalid'; // If an invalid movement is found, stop and return 'Invalid'.
      }
    }
    // The current position index must be even.
    else  {
      // Handle processing for steps appearing at even positions.
      if  (  secondaryAllowedMoves.includes(inputSteps[positionIndex - 1])  )  {
        continue; // Move to the next step if the movement is allowed.
      }
      else  {
        return  'Invalid'; // If an invalid movement is found, stop and return 'Invalid'.
      }
    }
  }

  return  'Valid'; // If the entire sequence is processed without invalid movements, return 'Valid'.
}

// Retrieve input from standard input, process the first line, and print the result to standard output.
process.stdout.write(verifyMovementSequence(require('node:fs').readFileSync('/dev/stdin', 'utf-8').split('\n')[0].trimEnd()));