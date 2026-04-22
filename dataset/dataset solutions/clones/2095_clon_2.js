'use strict'
// This module analyzes character sequences from an input stream.
function ProcessInputData(incomingText) {
  // Divide the input string into individual character components.
  let charComponents = incomingText.split("")

  // Transform all character components to their uppercase equivalent for normalization.
  charComponents = charComponents.map(charElement => charElement.toUpperCase())

  // Obtain the total quantity of character components.
  const totalQuantity = charComponents.length

  // Initialize a boolean indicator for detecting non-identical components.
  let foundDivergence = false

  // Commence the primary iteration through the components.
  for (let firstLoopIndex = 0; firstLoopIndex < totalQuantity; ++firstLoopIndex) {
    // Commence the secondary iteration through the components.
    for (let secondLoopIndex = 0; secondLoopIndex < totalQuantity; ++secondLoopIndex) {
      // Evaluate if the current indices refer to the same position.
      if (firstLoopIndex === secondLoopIndex) {
        // Bypass comparison if the indices are identical.
        continue
      }
      // Update the divergence indicator if the components at the current indices are distinct.
      foundDivergence = foundDivergence || charComponents[firstLoopIndex] !== charComponents[secondLoopIndex]
    }
  }

  // Display the outcome based on the final state of the divergence indicator.
  console.log(foundDivergence ? 'Yes' : 'No')
}

// Invoke the data processing function with content acquired from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"))