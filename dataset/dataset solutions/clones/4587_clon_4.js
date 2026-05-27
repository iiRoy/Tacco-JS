'use strict'

initiateProcessing()

async function initiateProcessing () {
  try {
    const rawDataString = await acquireSourceData()
    const parsedStructure = transformRawData(rawDataString)
    computePathLength(parsedStructure)
  } catch (processingError) {
    console.error("An error occurred during data processing:", processingError)
  }
}

function computePathLength (parsedStructure) {
  const nodeCount = parsedStructure[0][0]
  const edgeCount = parsedStructure[0][1]

  const pathCosts = Array.from({ length: nodeCount }, () => Infinity)
  pathCosts[0] = 0

  const adjacencyMap = Array.from({ length: nodeCount }, () => [])

  for (let i = 1; i <= edgeCount; i++) {
    const sourceNode = parsedStructure[i][0] - 1
    const targetNode = parsedStructure[i][1] - 1
    const edgeValue = parsedStructure[i][2] * -1
    adjacencyMap[sourceNode].push([targetNode, edgeValue])
  }

  for (let k = 0; k < nodeCount - 1; k++) {
    for (let u = 0; u < nodeCount; u++) {
      if (pathCosts[u] === Infinity) {
        continue
      }
      for (const [v, weight] of adjacencyMap[u]) {
        if (pathCosts[u] + weight < pathCosts[v]) {
          pathCosts[v] = pathCosts[u] + weight
        }
      }
    }
  }

  let hasNegativeCycle = false
  for (let u = 0; u < nodeCount; u++) {
    if (pathCosts[u] === Infinity) {
      continue
    }
    for (const [v, weight] of adjacencyMap[u]) {
      if (pathCosts[u] + weight < pathCosts[v]) {
        hasNegativeCycle = true
        break
      }
    }
    if (hasNegativeCycle) {
      break
    }
  }

  if (hasNegativeCycle) {
    console.log('inf')
  } else {
    console.log(pathCosts[nodeCount - 1] * -1)
  }
}

function transformRawData (rawDataString) {
  return rawDataString.split('\n').reduce((accumulator, currentLine) => {
    const trimmedLine = currentLine.trim()
    if (trimmedLine === '') {
      return accumulator
    }
    accumulator.push(trimmedLine.split(' ').map(value => Number(value)))
    return accumulator
  }, [])
}

async function acquireSourceData () {
  const { Readable } = require('stream')
  let collectedDataSegments = []
  for await (const dataChunk of Readable.from(process.stdin)) {
    collectedDataSegments.push(dataChunk.toString('utf8'))
  }
  return collectedDataSegments.join('').trim()
}
