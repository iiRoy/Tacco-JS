"use strict" ;

const processInputData = rawDataString => {
  // Clean up the initial input string by trimming and splitting into lines
  rawDataString = rawDataString .trim() .split("\n") ;

  // Parse the first line to extract the total record count and the target numeric value
  const recordCount = parseInt(rawDataString[0] .split(" ")[0] , 10) ;
  const targetValue = parseInt(rawDataString[0] .split(" ")[1] , 10) ;

  // Process subsequent input lines, converting them into an array of number pairs
  const dataPairs = rawDataString .slice(1, recordCount + 1) .map( lineStr => lineStr.split(" ").map( valStr => parseInt(valStr, 10) ) ) ;

  // Initialize a collection to store items with their cumulative quantities
  let cumulativeList = [ { identifier: dataPairs[0][0], quantity: dataPairs[0][1], cumulativeQuantity: dataPairs[0][1] } ] ;
  let runningTotal = dataPairs[0][1] ; // Keep track of the aggregate sum

  // Iterate through the remaining data pairs to populate the cumulative list
  for ( let idx = 1 ; idx < recordCount ; idx++ ) {
    runningTotal += dataPairs[idx - 1][1] ; // Add the quantity of the preceding item to the current running total
    let currentItemSummary = { identifier: dataPairs[idx][0], quantity: dataPairs[idx][1], cumulativeQuantity: runningTotal } ;

    cumulativeList .push(currentItemSummary) ; // Append the new summary object to the list
  }

  // Search the cumulative list for the first entry that meets or exceeds the target value
  for ( let loopIndex in cumulativeList ) {
    if ( cumulativeList[loopIndex] .cumulativeQuantity >= targetValue ) {
      // If the current item's cumulative sum is at or above the target, determine the relevant identifier
      const selectedItemCode = cumulativeList[loopIndex] .cumulativeQuantity - cumulativeList[loopIndex] .quantity < targetValue
        ? cumulativeList[loopIndex] .identifier // The current item is the first to cross the threshold
        : cumulativeList[loopIndex - 1] .identifier ; // The previous item was the last one before crossing

      console.log(selectedItemCode) ; // Output the chosen identifier
      return ; // Terminate function execution as the result has been found
    }
  }

  // This part is a fallback, typically for debugging or unexpected scenarios where no item meets the condition
  console.log( JSON.stringify(cumulativeList) ) ;
} ;

// Invoke the primary data processing function, reading input from standard input
processInputData( require('fs') .readFileSync( '/dev/stdin' , 'utf8' ) ) ;