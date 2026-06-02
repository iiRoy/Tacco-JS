var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource;
var rawInputLines = [];

inputReader.on('line', function(lineContent){
  rawInputLines.push(lineContent);
});

inputReader.on('close', function(){
  inputSource = setupInputReader(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepClone(item){
  return (item instanceof Set) ? new Set(Array.from(item)) : JSON.parse(JSON.stringify(item));
}

function getNextInt(){ return dataTransformer(retrieveNext(), 1); }
function getNextStrArray(){ return dataTransformer(retrieveNext(), 2); }
function getNextIntArray(){ return dataTransformer(retrieveNext(), 4); }
function getNextCharArray(){ return dataTransformer(retrieveNext(), 6); }

function retrieveNext(){ return inputSource.retrieveNextLine(); }
function checkHasMoreLines(){ return inputSource.hasMoreLines(); }

function setupInputReader(lines){
  return {
    inputLines : lines,
    currentLineIndex : 0,
    totalLines : lines.length,
    hasMoreLines : function(){ return (this.currentLineIndex < this.totalLines); },
    retrieveNextLine : function(){
      if(this.hasMoreLines()){
        return this.inputLines[this.currentLineIndex++];
      } else {
        throw 'EndOfInputException: No more input available';
      }
    }
  };
}

function printResult(outputValue){ console.log(outputValue); }
function logDebug(debugMessage){ console.error('debug:' + require('util').inspect(debugMessage, false, null)); }

function dataTransformer(inputItem, transformType){
  try {
    switch(transformType){
      case 1: return parseInt(inputItem);
      case 2: return inputItem.split(' ');
      case 4: return inputItem.split(' ').map(Number);
      case 6: return inputItem.split('');
      case 7: return inputItem.split('').map(Number);
      case 8: return inputItem.join(' ');
      case 9: return inputItem.join('\n');
      case 0: return inputItem.join('');
      default: return inputItem;
    }
  } catch(e) {
    return inputItem;
  }
}

function executeMainLogic(){
  var firstLineData = getNextIntArray();
  var nodeCount = firstLineData[0];
  var maxColors = firstLineData[1];
  var moduloValue = 1000000007;

  var graphNodes = new Array(nodeCount);
  for(var idx = 0; idx < nodeCount; idx++){
    graphNodes[idx] = {
      adjacent : [],
      vertexId : idx,
      colorOptions : 0,
      visited : false
    };
  }

  for(var idx = 0; idx < nodeCount - 1; idx++){
    var edgeData = getNextIntArray();
    graphNodes[edgeData[0] - 1].adjacent.push(edgeData[1] - 1);
    graphNodes[edgeData[1] - 1].adjacent.push(edgeData[0] - 1);
  }

  graphNodes[0].visited = true;
  // Initial call for root node: current node index, ancestor color exclusions, available colors for this node, total K
  computeTreeColorings(0, 0, maxColors, maxColors);

  var finalProduct = 1;
  for(var idx = 0; idx < nodeCount; idx++){
    finalProduct = (finalProduct * graphNodes[idx].colorOptions) % moduloValue;
    if(finalProduct === 0){
      break;
    }
  }
  printResult(finalProduct);

  // Recursive function to compute color options for each node
  function computeTreeColorings(currentVertexIndex, ancestorExclusions, availableColorsForCurrent, totalK){
    graphNodes[currentVertexIndex].colorOptions = availableColorsForCurrent;

    let nextAncestorExclusions = ancestorExclusions < 2 ? ancestorExclusions + 1 : 2;
    let processedChildCount = 0;

    let adjacentVertices = graphNodes[currentVertexIndex].adjacent;
    for(let i = 0; i < adjacentVertices.length; i++){
      let neighborIdx = adjacentVertices[i];
      if(!graphNodes[neighborIdx].visited){
        graphNodes[neighborIdx].visited = true;
        let colorsForChild = totalK - processedChildCount - nextAncestorExclusions;
        computeTreeColorings(neighborIdx, nextAncestorExclusions, colorsForChild, totalK);
        processedChildCount++;
      }
    }
  }
}
