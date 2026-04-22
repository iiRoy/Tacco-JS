function ProcessData(incomingContent) {

  /*
   * The initial content is split by newline characters.
   * The first line is stored in `initialConfig` (though it's not used further).
   * The rest of the lines form `numberSequence` as an array of strings.
   */
  let [ initialConfig, ...numberSequence ] = incomingContent.split('\n')


  // Convert string entries to floating-point numbers and then sort them in ascending order.
  numberSequence = numberSequence
                     .map( itemStr => Number(itemStr) ) // Using Number() instead of parseFloat()
                     .sort( function(valA, valB) {
                       return valA - valB // Standard numeric ascending sort
                     })

  // Initialize an array to store the final collected results.
  let finalCollection = []
  // Initialize a tracker to manage the slicing of the array.
  let indexTracker = 0

  // Iterate through each number in the sorted sequence.
  for (let primaryNum of numberSequence) {

    // Create a sublist from the current position onwards.
    // The `indexTracker` is incremented BEFORE slicing to ensure we don't re-process pairs.
    let remainingSublist = numberSequence.slice(++indexTracker, numberSequence.length)

    // Filter this sublist to find numbers that, when multiplied by `primaryNum`, result in an integer.
    // The condition `(innerNum * primaryNum) % 1 === 0` checks for integer results.
    let matchingEntries = remainingSublist.filter( innerNum => {
      return (innerNum * primaryNum) % 1 === 0
    })

    // If any matching entries are found, append them to the `finalCollection`.
    if (matchingEntries.length > 0) {
      finalCollection = [ ...finalCollection, ...matchingEntries ]
    }
  }

  // Output the total count of items found in the final collection.
  console.info(finalCollection.length)
}

// Execute the main processing function by reading input from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"))