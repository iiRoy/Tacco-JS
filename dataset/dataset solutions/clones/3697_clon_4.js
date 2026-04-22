// A utility to determine the span of numerical values
function determineValueSpan(collectionOfNumbers) {
  const maximalElement = Math.max(...collectionOfNumbers)
  const minimalElement = Math.min(...collectionOfNumbers)
  return maximalElement - minimalElement
}

module.exports = {
  determineValueSpan,
}

function InitiateProcessing(sourceData) {
  const contentLines = sourceData.split("\n")
  // const count = parseInt(contentLines[0], 10)
  const numericalArray = contentLines[1].split(" ").map((numericString) => parseInt(numericString, 10))

  console.log(determineValueSpan(numericalArray))
}

if (typeof require !== 'undefined' && require.main === module) {
  InitiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"))
}