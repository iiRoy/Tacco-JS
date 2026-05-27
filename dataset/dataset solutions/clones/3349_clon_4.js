'use strict'

var mod = 1e9 + 7

function createGraphAdjacency(nodeCount, edgeData) {
  var graphMap = new Map()
  for (var i = 1; i <= nodeCount; i++) {
    graphMap.set(i, [])
  }

  for (var k = 0; k < edgeData.length; k++) {
    var nodeA = edgeData[k][0]
    var nodeB = edgeData[k][1]
    graphMap.get(nodeA).push(nodeB)
    graphMap.get(nodeB).push(nodeA)
  }
  return graphMap
}

function calculateTreeDP(startVertex, graphAdjacencyMap) {
  var parentTracker = new Map()
  var dfsTraversalStack = []
  var postOrderSequence = []
  var visitedSet = new Set()

  dfsTraversalStack.push([startVertex, null])
  visitedSet.add(startVertex)

  var tempPostOrderStack = []

  while (dfsTraversalStack.length > 0) {
    var current = dfsTraversalStack.pop()
    var currentVertex = current[0]
    var parentOfCurrent = current[1]

    parentTracker.set(currentVertex, parentOfCurrent)
    tempPostOrderStack.push(currentVertex)

    var neighbors = graphAdjacencyMap.get(currentVertex)
    for (var j = 0; j < neighbors.length; j++) {
      var neighbor = neighbors[j]
      if (neighbor !== parentOfCurrent && !visitedSet.has(neighbor)) {
        visitedSet.add(neighbor)
        dfsTraversalStack.push([neighbor, currentVertex])
      }
    }
  }

  while (tempPostOrderStack.length > 0) {
    postOrderSequence.push(tempPostOrderStack.pop())
  }

  var dpResultsMap = new Map()

  for (var l = 0; l < postOrderSequence.length; l++) {
    var nodeToProcess = postOrderSequence[l]
    var currentIncludeVal = 1
    var currentExcludeVal = 1

    var childrenOfNode = []
    var nodeNeighbors = graphAdjacencyMap.get(nodeToProcess)
    for (var m = 0; m < nodeNeighbors.length; m++) {
      var potentialChild = nodeNeighbors[m]
      if (parentTracker.get(potentialChild) === nodeToProcess) {
        childrenOfNode.push(potentialChild)
      }
    }

    for (var n = 0; n < childrenOfNode.length; n++) {
      var childNode = childrenOfNode[n]
      var childDP = dpResultsMap.get(childNode)
      var childInclude = childDP[0]
      var childExclude = childDP[1]

      currentIncludeVal = (currentIncludeVal * (childInclude + childExclude)) % mod
      currentExcludeVal = (currentExcludeVal * childInclude) % mod
    }
    dpResultsMap.set(nodeToProcess, [currentIncludeVal, currentExcludeVal])
  }

  return dpResultsMap.get(startVertex)
}

function computeFinalResult(nodeCount, edgeData) {
  var graphStructure = createGraphAdjacency(nodeCount, edgeData)
  var initialVertex = 1
  var finalDPValues = calculateTreeDP(initialVertex, graphStructure)
  return (finalDPValues[0] + finalDPValues[1]) % mod
}

function processInputAndDisplay(rawInputString) {
  var inputLines = rawInputString.split("\n")
  var totalNodes = Number(inputLines[0])
  var edgeListParsed = inputLines.slice(1).map(function(line) {
    return line.split(' ').map(Number)
  })
  var solutionOutput = computeFinalResult(totalNodes, edgeListParsed)
  console.log(solutionOutput)
}

processInputAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'))
