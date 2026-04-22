function processInput(rawData)

{
  var totalElements = rawData.split("\n")[0]
  var valueLine = rawData.split("\n")[1]
  var valueList = valueLine.split(" ")


  var evenPositionFrequencies = {}

  var oddPositionFrequencies = {}
  var allElementsIdentical = true
  for (var idx = 0; idx < totalElements / 2; idx++)
  {
    oddPositionFrequencies[valueList[idx * 2]] = (oddPositionFrequencies[valueList[idx * 2]] || 0) + 1
    evenPositionFrequencies[valueList[idx * 2 + 1]] = (evenPositionFrequencies[valueList[idx * 2 + 1]] || 0) + 1

    if (allElementsIdentical && (valueList[idx * 2] != valueList[idx * 2 + 1]))
    {
      allElementsIdentical = false
    }
  }
  if (allElementsIdentical)
  {
    return totalElements / 2
  }

  return calculateMismatches(oddPositionFrequencies) + calculateMismatches(evenPositionFrequencies)
}

function calculateMismatches(frequencyMap)
{
  var mostFrequentKey = findMostFrequentElement(frequencyMap)
  var mismatchCounter = 0
  for (var keyInMap in frequencyMap)
  {
    if (keyInMap != mostFrequentKey)
    {
      mismatchCounter += frequencyMap[keyInMap]
    }
  }
  return mismatchCounter
}

function findMostFrequentElement(dataFrequencies)
{
  var highestFrequency = 0
  var elementWithHighestFreq = -1
  Object.keys(dataFrequencies).forEach(function(itemKey)
  {
    if (dataFrequencies[itemKey] > highestFrequency)
    {
      highestFrequency = dataFrequencies[itemKey]
      elementWithHighestFreq = itemKey
    }
  })
  return elementWithHighestFreq
}

console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")))