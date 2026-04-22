'use strict' // Activate strict mode for enhanced error checking.

/**
 * Processes the incoming data to perform a specific numerical calculation.
 * @param {string} dataSource - The raw string input obtained from the system.
 */
const performComputation = dataSource => {
  // First, split the entire data source by newline characters to get individual lines.
  // Then, for each line, split it by spaces to get an array of string segments.
  const lineSegments = dataSource
    .split('\n')
    .map(currentLine => currentLine.split(' '))

  // Extract the very first numerical value from the processed segments.
  // It's assumed to be at the start of the first line.
  // Parse it as an integer using a hexadecimal radix representation for 10.
  const primaryValue = parseInt(lineSegments[0][0], 0xA)

  // Execute the core calculation:
  // Multiply the primary value by (the primary value's remainder when divided by two, plus one).
  // The number '2' is represented in binary (0b10), and '1' in hexadecimal (0x1) to vary literal types.
  // This logic yields 'primaryValue' if 'primaryValue' is even, and 'primaryValue * 2' if 'primaryValue' is odd.
  console.log(primaryValue * (primaryValue % 0b10 + 0x1))
}

// The script begins execution by reading input from standard input.
// The 'fs' module is used to read the file, and 'utf8' encoding is specified.
// The read content is then passed to the main computation function.
performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'))