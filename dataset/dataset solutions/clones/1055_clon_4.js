const comparisonTally = { value: 0 }

const combineSegments = (dataArray, startFirst, startSecond, endMerge) => {
  const lengthFirst = startSecond - startFirst
  const lengthSecond = endMerge - startSecond

  const tempBufferA = new Array(lengthFirst)
  for (let idxA = 0; idxA < lengthFirst; idxA++) {
    tempBufferA[idxA] = dataArray[startFirst + idxA]
  }

  const tempBufferB = new Array(lengthSecond)
  for (let idxB = 0; idxB < lengthSecond; idxB++) {
    tempBufferB[idxB] = dataArray[startSecond + idxB]
  }

  tempBufferA.push(Number.MAX_SAFE_INTEGER)
  tempBufferB.push(Number.MAX_SAFE_INTEGER)

  let pointerA = 0
  let pointerB = 0

  for (let currentWriteIndex = startFirst; currentWriteIndex < endMerge; currentWriteIndex++) {
    comparisonTally.value++
    if (tempBufferA[pointerA] < tempBufferB[pointerB]) {
      dataArray[currentWriteIndex] = tempBufferA[pointerA]
      pointerA++
    } else {
      dataArray[currentWriteIndex] = tempBufferB[pointerB]
      pointerB++
    }
  }
}

const performBottomUpSort = (dataArray) => {
  const sequenceLength = dataArray.length
  let segmentSize = 1

  while (segmentSize < sequenceLength) {
    for (let currentIterationPosition = 0; currentIterationPosition < sequenceLength; currentIterationPosition += 2 * segmentSize) {
      const startOfFirstSegment = currentIterationPosition
      const startOfSecondSegment = Math.min(currentIterationPosition + segmentSize, sequenceLength)
      const endOfMergedSegment = Math.min(currentIterationPosition + 2 * segmentSize, sequenceLength)

      if (startOfSecondSegment < endOfMergedSegment) {
        combineSegments(dataArray, startOfFirstSegment, startOfSecondSegment, endOfMergedSegment)
      }
    }
    segmentSize *= 2
  }
  return dataArray
}

const executeSortingProcess = (countParam, collectionParam) => {
  const finalSequence = performBottomUpSort(collectionParam)
  return [finalSequence, comparisonTally.value]
}

let totalElementsCount = 0
let accumulatedInput = ''

process.stdin.on('data', (dataChunk) => {
  accumulatedInput += dataChunk.toString()
})

process.stdin.on('end', () => {
  const lines = accumulatedInput.trim().split('\n')

  totalElementsCount = Number(lines[0].trim())
  const numericSequence = lines[1].trim().split(/\s+/).map(element => Number(element))

  const [sortedArrangement, operationCount] = executeSortingProcess(totalElementsCount, numericSequence)
  console.log(sortedArrangement.join(' '))
  console.log(operationCount)
  process.exit(0)
})