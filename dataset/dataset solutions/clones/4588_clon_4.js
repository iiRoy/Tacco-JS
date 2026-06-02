'use strict'

const { createInterface } = require('readline')

async function orchestrateExecution () {
  const rawInput = await acquireInputData()
  const processedInput = processRawData(rawInput)
  computeLongestPath(processedInput)
}

function computeLongestPath (problemData) {
  const nodeCount = problemData[0][0]
  const edgeCount = problemData[0][1]

  const graphEdges = []
  for (let k = 1; k <= edgeCount; k++) {
    const [src, dest, wt] = problemData[k]
    graphEdges.push({
      source: src - 1,
      target: dest - 1,
      cost: wt * -1
    })
  }

  const pathDistances = new Array(nodeCount).fill(Infinity)
  pathDistances[0] = 0

  let hasNegativeCycle = false

  for (let passIteration = 0; passIteration < nodeCount; passIteration++) {
    let anyDistanceUpdatedInThisPass = false
    for (const { source, target, cost } of graphEdges) {
      if (pathDistances[source] !== Infinity && pathDistances[source] + cost < pathDistances[target]) {
        pathDistances[target] = pathDistances[source] + cost
        anyDistanceUpdatedInThisPass = true
        if (passIteration === nodeCount - 1) {
          hasNegativeCycle = true
        }
      }
    }
  }

  if (hasNegativeCycle) {
    console.log('inf')
  } else {
    console.log(pathDistances[nodeCount - 1] * -1)
  }
}

function processRawData (rawDataString) {
  const lineSegments = rawDataString.split('\n')
  const numericDataRows = []
  for (let k = 0; k < lineSegments.length; k++) {
    const currentLine = lineSegments[k]
    if (currentLine.trim() === '') continue
    const values = currentLine.split(' ').map(val => Number(val))
    numericDataRows.push(values)
  }
  return numericDataRows
}

async function acquireInputData () {
  let collectedInputLines = []
  const inputReader = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  for await (const lineContent of inputReader) {
    collectedInputLines.push(lineContent)
  }
  return collectedInputLines.join('\n').trim()
}

orchestrateExecution()
