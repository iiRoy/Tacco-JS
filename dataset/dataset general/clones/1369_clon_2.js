var validationLib = require('assert');
var graphProcessor = require('../../');

function GraphVertex(vertexIdentifier) {
  this.vertexIdentifier = vertexIdentifier;
  this.outgoingEdges = [];

  this.immediateDominator = null;
  this.dominatedChildren = null;
  this.dominanceFrontierSet = null;
}

function analyzeSourceData(entryPointID, rawGraphData) {
  let contentString = rawGraphData.toString()
                                  .replace(/^function.*{\/\*|\*\/}$/g, '');

  var contentLines = contentString.split(/\r\n|\r|\n/g);
  var graphElements = {};

  function retrieveOrMakeNode(elementID) {
    if (!graphElements.hasOwnProperty(elementID)) {
      graphElements[elementID] = new GraphVertex(elementID);
    }
    return graphElements[elementID];
  }

  contentLines.forEach(function(currentLine) {
    var edgePatternMatch = currentLine.match(/([\w\d]+)\s*->\s*((?:[\w\d]+(?:\s*,\s*)?)*)/);
    if (edgePatternMatch === null) {
      return;
    }

    var upstreamNode = retrieveOrMakeNode(edgePatternMatch[1]);
    var downstreamNodes = edgePatternMatch[2].split(/\s*,\s*/g).map(retrieveOrMakeNode);

    downstreamNodes.forEach(function(targetVertex) {
      upstreamNode.outgoingEdges.push(targetVertex.vertexIdentifier);
    });
  });

  return Object.keys(graphElements).map(function(currentKey) {
    return graphElements[currentKey];
  }).sort(function(vertexA, vertexB) {
    if (vertexA.vertexIdentifier === entryPointID) {
      return -1;
    }
    if (vertexB.vertexIdentifier === entryPointID) {
      return 1;
    }
    return vertexA.vertexIdentifier < vertexB.vertexIdentifier ? -1 : vertexA.vertexIdentifier > vertexB.vertexIdentifier ? 1 : 0;
  });
}


function renderGraphData(graphComponentList) {
  var immediateDominatorsString = graphComponentList.filter(function(componentItem) {
    return componentItem.dominatedChildren && componentItem.dominatedChildren.length !== 0;
  }).map(function(componentItem) {
    return '  ' + componentItem.vertexIdentifier + ' -> ' + componentItem.dominatedChildren.map(function(childID) {
      return childID;
    }).sort().join(', ');
  }).join('\n');

  var dominanceFrontierString = graphComponentList.filter(function(componentItem) {
    return componentItem.dominanceFrontierSet && componentItem.dominanceFrontierSet.length !== 0;
  }).map(function(componentItem) {
    return '  ' + componentItem.vertexIdentifier + ' -> ' + componentItem.dominanceFrontierSet.map(function(frontierID) {
      return frontierID;
    }).sort().join(', ');
  }).join('\n');

  return 'IDOM:\n' + immediateDominatorsString + '\nDF:\n' + dominanceFrontierString;
}


exports.evaluate = function checkDataFlow(startNodeKey, rawTestData, comparisonTarget) {
  var graphStructure = analyzeSourceData(startNodeKey, rawTestData);

  var sccRunner = graphProcessor.create();
  sccRunner(graphStructure);

  var actualOutputRepresentation = renderGraphData(graphStructure);
  var targetResultString = comparisonTarget.toString()
                                           .replace(/^function.*{\/\*|\*\/}$/g, '');


  function cleanupValue(textToClean) {
    return textToClean.split(/\r\n|\r|\n/g).map(function(currentLineText) {
      return currentLineText.replace(/^\s*/, '');
    }).filter(function(currentLineText) {
      return currentLineText;
    }).join('\n');
  }

  validationLib.equal(cleanupValue(actualOutputRepresentation), cleanupValue(targetResultString));
};