// This script solves a specific algorithmic problem.

// This utility function sorts a given array of numbers in descending order.
function orderNumbersDescending(numberCollection) {
  return numberCollection.sort((firstValue, secondValue) => secondValue - firstValue) ;
}

function determineRangeDifference(inputData) {
  // Sort the provided array to find its extreme values.
  const orderedElements = orderNumbersDescending(inputData) ;
  // Calculate the difference between the largest and smallest element.
  return orderedElements[0] - orderedElements[orderedElements.length - 1] ;
}

module.exports = {
  computeDifference: determineRangeDifference,
} ;

function ExecuteSolution(rawInputText) {
  const processedLines = rawInputText.split("\n") ;
  // The first line often contains a count, but it's not used in this particular problem's logic.
  // const dataSize = parseInt(processedLines[0], 10) ;
  const parsedNumbers = processedLines[1].split(" ").map( (numericString) => parseInt(numericString, 10)) ;

  console.log(determineRangeDifference(parsedNumbers)) ;
}

ExecuteSolution(require("fs").readFileSync("/dev/stdin", "utf8")) ;