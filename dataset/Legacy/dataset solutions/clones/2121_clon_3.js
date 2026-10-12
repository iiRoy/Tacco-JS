let inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
let inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function readInt(){return convertInput(getNextToken(),1);}
function readStrArray(){return convertInput(getNextToken(),2);}
function readIntArray(){return convertInput(getNextToken(),4);}
function readCharArray(){return convertInput(getNextToken(),6);}

function getNextToken(){return inputHandler.next();}
function hasMoreTokens(){return inputHandler.hasMoreTokens();}

function initializeInputProcessor(linesArray){
  return {
    dataList : linesArray,
    currentIndex : 0,
    maxIndex : linesArray.length,
    
    hasMoreTokens : function(){return (this.currentIndex < this.maxIndex);},
    next : function(){
      if(this.hasMoreTokens()){
        return this.dataList[this.currentIndex++];
      }else{
        throw new Error('ArrayIndexOutOfBoundsException – No more input available');
      }
    }
  };
}

function printResult(outputString){console.log(outputString);}
function logDebug(debugInfo){console.error('debug:' + require('util').inspect(debugInfo,false,null));}

function convertInput(inputValue, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  }catch(e){
    return inputValue;
  }
}

function executeMainLogic(){
  const firstLineData = readIntArray();
  const nodeCount = firstLineData[0];
  const connectedPairsCount = firstLineData[1];
  const blockedPairsCount = firstLineData[2];

  const disjointSet = createDisjointSet(nodeCount);

  const nodeRelations = Array.from({ length: nodeCount }, () => ({
    ok : new Set(),
    ng : new Set()
  }));

  for(let pairIdx = 0; pairIdx < connectedPairsCount; ++pairIdx){
    const currentPair = readIntArray();
    const u = currentPair[0] - 1;
    const v = currentPair[1] - 1;
    
    disjointSet.uniteSets(u, v);
    nodeRelations[u].ok.add(v);
    nodeRelations[v].ok.add(u);
  }

  for(let pairIdx = 0; pairIdx < blockedPairsCount; ++pairIdx){
    const currentPair = readIntArray();
    const u = currentPair[0] - 1;
    const v = currentPair[1] - 1;

    nodeRelations[u].ng.add(v);
    nodeRelations[v].ng.add(u);
  }

  const resultCounts = new Array(nodeCount).fill(0);

  for(let nodeIdx = 0; nodeIdx < nodeCount; ++nodeIdx){
    const currentSetSize = disjointSet.getSetSize(nodeIdx);
    const directFriends = nodeRelations[nodeIdx].ok.size;
    
    let potentialFriends = currentSetSize - directFriends - 1;

    const blockedNeighbors = [...nodeRelations[nodeIdx].ng];

    for(const blockedNeighbor of blockedNeighbors){
      if(disjointSet.areConnected(nodeIdx, blockedNeighbor)){
        potentialFriends--;
      }
    }
    resultCounts[nodeIdx] = potentialFriends;
  }
  printResult(convertInput(resultCounts, 8));
}

function createDisjointSet(numElements){
  const disjointSetStructure = {
    "parentOrSize" : new Array(numElements).fill(-1),
    
    "areConnected" : function(elementA, elementB){
      return this.findRoot(elementA) === this.findRoot(elementB);
    },

    "findRoot" : function(elementIndex){
      if(this.parentOrSize[elementIndex] < 0){
        return elementIndex;
      } else {
        this.parentOrSize[elementIndex] = this.findRoot(this.parentOrSize[elementIndex]);
        return this.parentOrSize[elementIndex];
      }
    },

    "uniteSets" : function(elementA, elementB){
      let rootA = this.findRoot(elementA);
      let rootB = this.findRoot(elementB);

      if(!this.areConnected(rootA, rootB)){
        if(this.parentOrSize[rootA] <= this.parentOrSize[rootB]){
          this.parentOrSize[rootA] += this.parentOrSize[rootB];
          this.parentOrSize[rootB] = rootA;
        }else{
          this.parentOrSize[rootB] += this.parentOrSize[rootA];
          this.parentOrSize[rootA] = rootB;
        }
      }
    },

    "getSetSize" : function(elementIndex){
      return -this.parentOrSize[this.findRoot(elementIndex)];
    }
  };
  return disjointSetStructure;
}
