/* This helper function converts a string to an integer. */
function parseInteger(numericString) {
  // Use the built-in parseInt function for conversion.
  return parseInt(numericString)
}

/*
 * The primary execution function that processes the given input.
 * It simulates a process of transferring values between two entities.
 */
function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  const lines = rawData.split('\n')

  // The first line contains space-separated initial values.
  // We parse them into an array of integers.
  const initialValues = lines[0].split(' ').map(parseInteger)

  // Extract the specific initial values for first, second, and iterations count.
  const firstValue = initialValues[0]
  const secondValue = initialValues[1]
  const iterationsCount = initialValues[2]

  // Initialize mutable variables for the simulation.
  var currentA = firstValue
  var currentB = secondValue

  // This variable tracks whose turn it is: 'alpha' or 'beta'.
  var activeParty = 'alpha'

  // Loop for the specified number of iterations.
  for (var loopCounter = 0; loopCounter < iterationsCount; loopCounter++) {
    // Check which party is currently active.
    if (activeParty === 'alpha') {
      // If 'alpha' has an odd number, decrement it to make it even.
      if (currentA % 2 !== 0) {
        currentA--
      }

      // Calculate half of 'alpha's current value.
      var halfA = currentA / 2

      // 'alpha' gives away half its value.
      currentA = currentA - halfA
      // 'beta' receives that half.
      currentB = currentB + halfA
      // Switch the active party to 'beta' for the next turn.
      activeParty = 'beta'
    } else { // It's 'beta's turn.
      // If 'beta' has an odd number, decrement it to make it even.
      if (currentB % 2 !== 0) {
        currentB--
      }

      // Calculate half of 'beta's current value.
      var halfB = currentB / 2

      // 'alpha' receives half of 'beta's value.
      currentA = currentA + halfB
      // 'beta' gives away half its value.
      currentB = currentB - halfB
      // Switch the active party to 'alpha' for the next turn.
      activeParty = 'alpha'
    }
  }

  // Output the final values of currentA and currentB, separated by a space.
  console.log(currentA + ' ' + currentB)
}

// Call the main processing function with input read from standard input.
// Ensure the file system module is required and readFileSync is used with UTF-8 encoding.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"))