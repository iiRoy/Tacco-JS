'use strict'
const readline = require('readline')

;(async () => {
  const lineReader = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  let allLines = []
  for await (const lineContent of lineReader) {
    allLines.push(lineContent)
  }

  const numericData = allLines.map(rowText =>
    rowText.split(' ').map(Number)
  )

  const nodeCount = numericData[0][0]
  const edgeCount = numericData[0][1]

  const pathwayList = []
  for (let idx = 0; idx < edgeCount; ++idx) {
    const segmentInfo = numericData[idx + 1]
    pathwayList.push({
      origin: segmentInfo[0] - 1,
      destination: segmentInfo[1] - 1,
      cost: segmentInfo[2] * -1
    })
  }

  const vertexValues = new Array(nodeCount).fill(Number.MAX_SAFE_INTEGER)
  vertexValues[0] = 0

  for (let iteration = 0; iteration < nodeCount; ++iteration) {
    let roundModified = false
    const previousRoundValues = [...vertexValues]

    for (const link of pathwayList) {
      const startPoint = link.origin
      const endPoint = link.destination
      const travelCost = link.cost

      if (previousRoundValues[startPoint] !== Number.MAX_SAFE_INTEGER) {
        if (vertexValues[endPoint] > previousRoundValues[startPoint] + travelCost) {
          vertexValues[endPoint] = previousRoundValues[startPoint] + travelCost
          roundModified = true
        }
      }
    }

    if (!roundModified && iteration < nodeCount - 1) {
      break
    }
    
    if (iteration === nodeCount - 1 && roundModified) {
      console.log('inf')
      return
    }
  }

  let finalValue = vertexValues[nodeCount - 1]
  if (finalValue === Number.MAX_SAFE_INTEGER) {
    finalValue = Infinity
  }
  console.log(finalValue * -1)
})()