'use strict'

function AlternativeProcessor(sourceText) {
  const linesOfContent = sourceText.trim().split('\n')

  const firstLineData = linesOfContent[0].match(/\d+/g).map(Number)
  const vertexCount = firstLineData[0]
  const startVertexA = firstLineData[1]
  const startVertexB = firstLineData[2]

  const treeEdges = linesOfContent.slice(1).map(line => line.match(/\d+/g).map(Number))

  const neighborConnections = new Array(vertexCount + 1)
  for (let idx = 0; idx <= vertexCount; ++idx) {
    neighborConnections[idx] = new Set()
  }

  for (const edge of treeEdges) {
    const extremityOne = edge[0]
    const extremityTwo = edge[1]
    neighborConnections[extremityOne].add(extremityTwo)
    neighborConnections[extremityTwo].add(extremityOne)
  }

  const distanceFromB = new Map()
  const wayfarerQueue = []

  wayfarerQueue.push([startVertexB, 0])
  distanceFromB.set(startVertexB, 0)

  let head = 0
  while (head < wayfarerQueue.length) {
    const [currentWayfarer, wayfarerDistance] = wayfarerQueue[head++]

    for (const nextWayfarer of neighborConnections[currentWayfarer]) {
      if (!distanceFromB.has(nextWayfarer)) {
        distanceFromB.set(nextWayfarer, wayfarerDistance + 1)
        wayfarerQueue.push([nextWayfarer, wayfarerDistance + 1])
      }
    }
  }

  let peakJourney = 0
  for (const distVal of distanceFromB.values()) {
    if (distVal > 0) {
      peakJourney = Math.max(peakJourney, distVal - 1)
    }
  }

  console.log(peakJourney)
}

AlternativeProcessor(require("fs").readFileSync("/dev/stdin", "utf8"))