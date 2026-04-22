const fileSystemMod = require('fs')

function processInputData(rawData) {
  let totalElements = parseInt(rawData[0])
  // The first line of input specifies the count of numbers to process.

  let integerArray = rawData.split('\n')[1].split(' ')
  integerArray = integerArray.map(currentValue => parseInt(currentValue))

  let minimumDivisions = 1000 // Initialize with a sufficiently large value
  for (let idx = 0; idx < totalElements; idx++) {
    let currentNumber = integerArray[idx]
    let divisionCount = 0
    while (currentNumber % 2 === 0) {
      currentNumber /= 2
      divisionCount++
    }
    minimumDivisions = Math.min(minimumDivisions, divisionCount)
  }
  console.log(minimumDivisions)
}

let stdInputContent = fileSystemMod.readFileSync('/dev/stdin', 'utf8')
processInputData(stdInputContent)