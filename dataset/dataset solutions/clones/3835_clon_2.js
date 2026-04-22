function processInput (rawData) {
  const textRows = rawData.split('\n')
  const firstRowParts = textRows[0].split(' ')

  const nodeCount = Number.parseInt(firstRowParts[0], 0xA) // Number of nodes in the graph
  const edgeCount = Number.parseInt(firstRowParts[1], 10) // Number of edges or connections

  let priorityValues = textRows[1].split(' ')
  for (let loopIdx = 0; loopIdx < priorityValues.length; loopIdx++) {
    priorityValues[loopIdx] = Number.parseInt(priorityValues[loopIdx], 10)
  }

  const connectionData = [] // Stores the graph connections
  for (let outerIdx = 0; outerIdx < edgeCount; outerIdx++) {
    connectionData[outerIdx] = textRows[outerIdx + 2].split(' ')
    connectionData[outerIdx][0] = Number.parseInt(connectionData[outerIdx][0], 10)
    connectionData[outerIdx][1] = Number.parseInt(connectionData[outerIdx][1], 10)
  }

  let successfulPaths = 0 // Counter for paths reaching target
  for (let currentStartNodeIdx = 0; currentStartNodeIdx < nodeCount; currentStartNodeIdx++) {
    let keepLooping = true
    let previousConnections = []
    let currentConnections = [currentStartNodeIdx + 1] // Nodes to explore in current step
    let nextConnections = [] // Nodes discovered for the next step
    let allVisitedNodes = [currentStartNodeIdx + 1] // All nodes visited so far in this traversal

    const targetNode = priorityValues[currentStartNodeIdx] // The specific target for this start node

    do {
      for (let subIdx = 0; subIdx < currentConnections.length; subIdx++) {
        for (let linkIdx = 0; linkIdx < edgeCount; linkIdx++) {
          if (connectionData[linkIdx][0] === currentConnections[subIdx]) {
            // Check if the connected node is new
            if (currentConnections.indexOf(connectionData[linkIdx][1]) === -1 && allVisitedNodes.indexOf(connectionData[linkIdx][1]) === -1) {
              nextConnections.push(connectionData[linkIdx][1])
              allVisitedNodes.push(connectionData[linkIdx][1])
            }
          } else if (connectionData[linkIdx][1] === currentConnections[subIdx]) {
            // Check if the other connected node is new
            if (currentConnections.indexOf(connectionData[linkIdx][0]) === -1 && allVisitedNodes.indexOf(connectionData[linkIdx][0]) === -1) {
              nextConnections.push(connectionData[linkIdx][0])
              allVisitedNodes.push(connectionData[linkIdx][0])
            }
          }

          if (currentConnections.indexOf(targetNode) >= 0) {
            break // Target found, exit inner link loop
          }
        }
        if (currentConnections.indexOf(targetNode) >= 0) {
          break // Target found, exit sub-index loop
        }
      }

      if (currentConnections.indexOf(targetNode) >= 0) {
        successfulPaths += 1
        keepLooping = false // Path found, stop iterating for this start node
      }

      if (previousConnections === currentConnections) {
        // If no new paths were found in the last iteration
        keepLooping = false
      } else {
        const nodesForNextIteration = []
        for (let tempIdx = 0; tempIdx < nextConnections.length; tempIdx++) {
          if (currentConnections.indexOf(nextConnections[tempIdx]) === -1) {
            nodesForNextIteration.push(nextConnections[tempIdx])
          }
        }
        currentConnections = nodesForNextIteration
        previousConnections = currentConnections
        nextConnections = [] // Clear for next iteration
      }
    } while (keepLooping === true)
  }
  console.info(successfulPaths)
}
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }))