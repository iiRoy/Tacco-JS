'use strict'

executeProgram()

function executeProgram (programArguments) {
  readInputData()
    .then(processRawInput)
    .then(calculateShortestPath)
}

function calculateShortestPath (processedInput) {
  const nodeCount = processedInput[0][0]
  const edgeCount = processedInput[0][1]

  let distances = new Array(nodeCount).fill(Infinity)
  distances[0] = 0

  const graphEdges = []
  for (let i = 0; i < edgeCount; i++) {
    const edgeData = processedInput[i + 1]
    graphEdges.push({
      sourceNode: edgeData[0] - 1,
      targetNode: edgeData[1] - 1,
      weightValue: edgeData[2] * -1
    })
  }

  let iterationCounter = 0
  let hasNegativeCycle = false

  while (true) {
    let hasAnyUpdateOccurred = false
    for (const currentEdge of graphEdges) {
      if (distances[currentEdge.sourceNode] === Infinity) {
        continue
      }

      const potentialNewDistance = distances[currentEdge.sourceNode] + currentEdge.weightValue

      if (distances[currentEdge.targetNode] > potentialNewDistance) {
        distances[currentEdge.targetNode] = potentialNewDistance
        hasAnyUpdateOccurred = true
      }
    }

    if (!hasAnyUpdateOccurred) {
      break
    } else {
      iterationCounter++
    }

    if (iterationCounter === nodeCount) {
      hasNegativeCycle = true
      break
    }
  }

  if (hasNegativeCycle) {
    console.log('inf')
  } else {
    console.log(distances[nodeCount - 1] * -1)
  }
}

function processRawInput (rawDataString) {
  const lines = rawDataString.split('\n')
  const processedLines = lines.map(lineContent => {
    const stringNumbers = lineContent.split(' ')
    return stringNumbers.map(Number)
  })
  return processedLines
}

function readInputData () {
  return new Promise((resolvePromise) => {
    let inputChunks = []
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (dataChunk) => {
      inputChunks.push(dataChunk)
    })
    process.stdin.on('end', () => {
      const fullInputString = inputChunks.join('').trim()
      resolvePromise(fullInputString)
    })
  })
}
