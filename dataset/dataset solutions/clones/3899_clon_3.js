'use strict'
let upperBound = 109

function performCountingSort(dataElements) {
  const resultantSortedArray = []
  let frequencyCounter = Array(upperBound + 1).fill(0)

  for (const elementValue of dataElements) {
    const numericElement = Number(elementValue); // Ensure numeric conversion
    if (numericElement >= 0 && numericElement <= upperBound) {
      frequencyCounter[numericElement]++
    }
  }

  for (let currentNum = 0; currentNum <= upperBound; currentNum++) {
    let currentCount = frequencyCounter[currentNum]
    while (currentCount > 0) {
      resultantSortedArray.push(currentNum)
      currentCount--
    }
  }

  return resultantSortedArray
}

function executeLogic(inputContent) {
  const rawValueStrings = inputContent.split(/\n|\s/)
  const numericInputArray = rawValueStrings.map(val => Number(val))

  const totalElements = numericInputArray[0]
  const originalDataArray = numericInputArray.slice(1, -1)
  const sortedDataCollection = performCountingSort(originalDataArray)

  const middleIndex = totalElements / 2
  const medianValue = sortedDataCollection[middleIndex]

  const alternativeOutputValue = sortedDataCollection[middleIndex - 1]

  for (let currentIndex = 0; currentIndex < totalElements; currentIndex++) {
    const currentOriginalElement = originalDataArray[currentIndex]
    if (currentOriginalElement < medianValue) {
      console.log(medianValue)
    } else {
      console.log(alternativeOutputValue)
    }
  }
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'))
