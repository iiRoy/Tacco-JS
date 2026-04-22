'use strict'
// This script is designed to manipulate numerical inputs from the standard stream.
function ProcessInputData(rawData) {
  // Split the entire block of raw input text into an array of strings, one per line.
  const lineCollection = rawData.split('\n')

  // Parse three distinct numerical components from the very first line of the input.
  const initialOperand = Number(lineCollection[0].split(' ')[0]) // The primary value to be operated upon.
  const secondaryOperand = Number(lineCollection[0].split(' ')[1]) // The auxiliary value for calculations.
  const reductionQuantity = Number(lineCollection[0].split(' ')[2]) // The amount by which values might be reduced.

  // Execute conditional calculations and present the derived outcomes to the console.
  console.log(
    (initialOperand > reductionQuantity ? initialOperand - reductionQuantity : 0), // First result: either the primary value reduced, or zero if reduction is not possible.
    (initialOperand > reductionQuantity ? secondaryOperand : (initialOperand + secondaryOperand > reductionQuantity ? initialOperand + secondaryOperand - reductionQuantity : 0)) // Second result: either the auxiliary value, or the sum of both operands reduced (or zero).
  )
}

// Invoke the main processing function, providing it with content read from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'))