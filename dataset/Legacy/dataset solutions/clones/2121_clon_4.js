const lineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputProcessor;
const rawInputLines = [];

lineReader.on('line', function(inputLine){rawInputLines.push(inputLine);});
lineReader.on('close', function(){
  inputProcessor = new InputSource(rawInputLines);
  console.error('\n↑Input ↓Output');
  ProcessGraph();
});

function createDeepClone(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

class InputSource {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
  }

  hasMore() {
    return this.currentLineIndex < this.dataLines.length;
  }

  fetchNext() {
    if (this.hasMore()) {
      return this.dataLines[this.currentLineIndex++];
    } else {
      throw new Error('InputExhaustedException: No more input available.');
    }
  }
}

const transformationMap = new Map([
  [1, (val) => parseInt(val)],
  [2, (val) => val.split(' ')],
  [4, (val) => val.split(' ').map(Number)],
  [6, (val) => val.split('')],
  [7, (val) => val.split('').map(Number)],
  [8, (val) => val.join(' ')],
  [9, (val) => val.join('\n')],
  [0, (val) => val.join('')]
]);

function transformInput(value, typeIdentifier) {
  try {
    const transformer = transformationMap.get(typeIdentifier);
    return transformer ? transformer(value) : value;
  } catch (e) {
    return value;
  }
}

function getNextInteger(){return transformInput(fetchNextLine(),1);}
function getNextStringArray(){return transformInput(fetchNextLine(),2);}
function getNextIntegerArray(){return transformInput(fetchNextLine(),4);}
function getNextCharacterArray(){return transformInput(fetchNextLine(),6);}
function fetchNextLine(){return inputProcessor.fetchNext();}
function checkMoreInput(){return inputProcessor.hasMore();}

function displayResult(content){console.log(content);}
function logDebug(content){console.error('debug:' + require('util').inspect(content,false,null));}

function ProcessGraph(){
  const initialParams = getNextIntegerArray();
  const nodeCount = initialParams[0];
  const friendCount = initialParams[1];
  const blockCount = initialParams[2];

  const dsuInstance = new DisjointSetUnion(nodeCount);

  const nodeRelationships = Array.from({ length: nodeCount }, () => ({
    friendlyLinks: new Set(),
    blockedLinks: new Set()
  }));

  Array.from({ length: friendCount }).forEach(() => {
    const currentPair = getNextIntegerArray();
    const nodeA = currentPair[0] - 1;
    const nodeB = currentPair[1] - 1;
    dsuInstance.uniteSets(nodeA, nodeB);
    nodeRelationships[nodeA].friendlyLinks.add(nodeB);
    nodeRelationships[nodeB].friendlyLinks.add(nodeA);
  });

  Array.from({ length: blockCount }).forEach(() => {
    const currentPair = getNextIntegerArray();
    const nodeA = currentPair[0] - 1;
    const nodeB = currentPair[1] - 1;
    nodeRelationships[nodeA].blockedLinks.add(nodeB);
    nodeRelationships[nodeB].blockedLinks.add(nodeA);
  });

  const resultArray = Array.from({ length: nodeCount }, (_, idx) => {
    let potentialFriends = dsuInstance.getComponentSize(idx) - nodeRelationships[idx].friendlyLinks.size - 1;

    const blockedInComponent = Array.from(nodeRelationships[idx].blockedLinks)
      .filter(blockedNode => dsuInstance.areConnected(idx, blockedNode))
      .length;
    
    return potentialFriends - blockedInComponent;
  });

  displayResult(transformInput(resultArray, 8));
}

class DisjointSetUnion {
  constructor(size) {
    this.parentArray = Array.from({ length: size }, (_, i) => i);
    this.componentSizes = Array(size).fill(1);
  }

  findRepresentative(element) {
    if (this.parentArray[element] === element) {
      return element;
    }
    this.parentArray[element] = this.findRepresentative(this.parentArray[element]);
    return this.parentArray[element];
  }

  areConnected(elemA, elemB) {
    return this.findRepresentative(elemA) === this.findRepresentative(elemB);
  }

  uniteSets(elemA, elemB) {
    let repA = this.findRepresentative(elemA);
    let repB = this.findRepresentative(elemB);

    if (repA !== repB) {
      if (this.componentSizes[repA] < this.componentSizes[repB]) {
        [repA, repB] = [repB, repA];
      }
      this.parentArray[repB] = repA;
      this.componentSizes[repA] += this.componentSizes[repB];
    }
  }

  getComponentSize(element) {
    return this.componentSizes[this.findRepresentative(element)];
  }
}
