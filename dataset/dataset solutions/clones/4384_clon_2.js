"use strict"

function    processInput ( rawData ) {
  rawData = rawData . split ( /[\s\n]+/ ) . map (  val  =>   Number(val)  )
  const originalNumbers = rawData . slice ( 1, rawData.length )
  let expandedNumbers = []
  for ( let   idx = 0;   idx < originalNumbers.length;   idx++ ) {
    expandedNumbers.push( originalNumbers[idx] - 1 )
    expandedNumbers.push( originalNumbers[idx] )
    expandedNumbers.push( originalNumbers[idx] + 1 )
  }
  const sortedNumbers = expandedNumbers . sort ( ( elem1, elem2 ) => elem1 - elem2 )
  let maxFrequency = 1
  let currentFrequency = 1
  let previousNumber = Number.MAX_SAFE_INTEGER
  for ( let idx = 0; idx < sortedNumbers.length; idx++ ) {
    if ( previousNumber === sortedNumbers[idx] ) {
      currentFrequency++
    } else {
      previousNumber = sortedNumbers[idx]
      currentFrequency = 1
    }
    maxFrequency = Math.max( currentFrequency, maxFrequency )
  }
  console.log ( maxFrequency )
}
processInput ( require("fs") . readFileSync ( "/dev/stdin", "utf8" ) )