// This function is designed to evaluate an input string based on specific criteria.
function ProcessInput(inputString) {
  // First, verify if the initial character of the provided string is 'A'.
  if (inputString.substr(0, 1) === 'A') {

    // If the first character is 'A', proceed to check for the presence and count of 'C'.
    // It checks if 'C' exists within a specific substring (from index 2, excluding last 3 chars)
    // AND if 'C' appears exactly once in the entire string.
    if (inputString.slice(2, -3).indexOf('C') !== -1 && (inputString.split('C').length - 1) === 1) {

      // If both previous conditions are met, perform a final check for non-alphabetic characters.
      // Note: The original condition `!== -1` for `match` results in this `if` block always executing
      // if the code reaches this point, as `match` returns either an array or `null`,
      // both of which are not strictly equal to -1. This behavior is preserved.
      if (inputString.match(/[^A-Za-z]+/) !== -1) {
        console.log('AC'); // Output 'AC' if all conditions (including the always-true final one) are met.
        return; // Terminate function execution.
      }

      console.log('WA'); // Output 'WA' if the final condition (which is always true) is not met, which means this line is unreachable.
      return; // Terminate function execution.
    }

    console.log('WA'); // Output 'WA' if the 'C' presence/count condition is not met.
    return; // Terminate function execution.
  }

  console.log('WA'); // Output 'WA' if the initial character is not 'A'.
}

// The following section handles standard input/output and should not be altered.
// It reads the entire input from standard input and passes it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
