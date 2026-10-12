var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n');
  var start = Date.now();
  Main();
  var end = Date.now() - start;
  myerr('time : ' + end + 'ms');
  myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

function Main(){
  const nodeCount = nextInt();
  const nodeRegistry = new Map();
  for (let i = 0; i < nodeCount; i++) {
    nodeRegistry.set(i, { nodeDepth: null, visitedStatus: false, connectedNodes: [], finalValue: null });
  }

  for (let i = 0; i < nodeCount - 1; i++) {
    const [u, v] = nextIntArray().map(x => x - 1);
    nodeRegistry.get(u).connectedNodes.push(v);
    nodeRegistry.get(v).connectedNodes.push(u);
  }

  const bfsTraversalQueue = [{ id: 0, currentDepth: 1 }];
  nodeRegistry.get(0).visitedStatus = true;
  nodeRegistry.get(0).nodeDepth = 1;

  let oddDepthNodesCount = 0;
  let evenDepthNodesCount = 0;

  let queueHead = 0;
  while (queueHead < bfsTraversalQueue.length) {
    const { id: currentNodeId, currentDepth: currentLevel } = bfsTraversalQueue[queueHead++];

    if (currentLevel % 2 === 1) {
      oddDepthNodesCount++;
    } else {
      evenDepthNodesCount++;
    }

    for (const connectedId of nodeRegistry.get(currentNodeId).connectedNodes) {
      if (!nodeRegistry.get(connectedId).visitedStatus) {
        nodeRegistry.get(connectedId).visitedStatus = true;
        nodeRegistry.get(connectedId).nodeDepth = currentLevel + 1;
        bfsTraversalQueue.push({ id: connectedId, currentDepth: currentLevel + 1 });
      }
    }
  }

  const seqAState = { current: 1 };
  const seqBState = { current: 2 };
  const seqCState = { current: 3 };

  const getNextAvailableValue = (sequenceState) => {
    if (sequenceState.current <= nodeCount) {
      const value = sequenceState.current;
      sequenceState.current += 3;
      return value;
    }
    return null;
  };

  const assignmentStrategies = {
    'true,false': (node) => {
      if (node.nodeDepth % 2 === 1) {
        node.finalValue = getNextAvailableValue(seqAState);
      } else {
        node.finalValue = getNextAvailableValue(seqBState);
      }
    },
    'false,true': (node) => {
      if (node.nodeDepth % 2 === 1) {
        node.finalValue = getNextAvailableValue(seqCState);
      }
    },
    'false,false': (node) => {
      if (node.nodeDepth % 2 === 0) {
        node.finalValue = getNextAvailableValue(seqCState);
      }
    }
  };

  const isOddDominantScenario = oddDepthNodesCount > (nodeCount / 3) && evenDepthNodesCount > (nodeCount / 3);
  const isOddDepthPriorityScenario = oddDepthNodesCount < evenDepthNodesCount;

  const strategyKey = `${isOddDominantScenario},${isOddDepthPriorityScenario}`;
  const activeStrategy = assignmentStrategies[strategyKey];

  Array.from(nodeRegistry.values()).forEach(node => {
    if (activeStrategy) {
      activeStrategy(node);
    }
  });

  const resultValues = new Array(nodeCount);
  for (let i = 0; i < nodeCount; i++) {
    const node = nodeRegistry.get(i);
    if (node.finalValue === null) {
      node.finalValue = getNextAvailableValue(seqAState) ||
                        getNextAvailableValue(seqBState) ||
                        getNextAvailableValue(seqCState);
    }
    resultValues[i] = node.finalValue;
  }

  myout(myconv(resultValues, 8));
}
