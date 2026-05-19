var lineReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputLines = [];
var inputProcessor;

lineReader.on('line', function(inputLine){inputLines.push(inputLine);});
lineReader.on('close', function(){
  inputProcessor = new InputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function parseNextInt(){return dataConverter(fetchNextInput(), 1);}
function fetchNextStrArray(){return dataConverter(fetchNextInput(), 2);}
function parseNextIntArray(){return dataConverter(fetchNextInput(), 4);}
function fetchNextCharArray(){return dataConverter(fetchNextInput(), 6);}
function fetchNextInput(){return inputProcessor.next();}
function hasMoreInput(){return inputProcessor.hasNext();}

class InputProcessor {
  constructor(lines) {
    this.lineList = lines;
    this.currentIndex = 0;
    this.maxLines = lines.length;
  }

  hasNext() {
    return (this.currentIndex < this.maxLines);
  }

  next() {
    if (this.hasNext()) {
      return this.lineList[this.currentIndex++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException: No more input available.');
    }
  }
}

function printResult(outputString){console.log(outputString);}
function printDebug(debugContent){console.error('debug:' + require('util').inspect(debugContent,false,null));}

function dataConverter(inputValue, conversionType){
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

function executeSolution(){
  const initialParams = parseNextIntArray();
  const networkSize = initialParams[0];
  const kConnectionsCount = initialParams[1];
  const lConnectionsCount = initialParams[2];

  const unionFindK = new UnionFindStructure(networkSize);
  const unionFindL = new UnionFindStructure(networkSize);

  const connectionCounts = Array.from({ length: networkSize }, () => 1);

  const kRoadPairs = new Array(kConnectionsCount);
  const lRoadPairs = new Array(lConnectionsCount);

  const getProcessedPair = () => {
    const rawPair = parseNextIntArray();
    rawPair.sort((a, b) => a - b);
    rawPair[0]--;
    rawPair[1]--;
    return rawPair;
  };

  for(let i = 0; i < kConnectionsCount; i++){
    const currentPair = getProcessedPair();
    kRoadPairs[i] = currentPair;
    unionFindK.uniteSets(currentPair[0], currentPair[1]);
  }

  for(let i = 0; i < lConnectionsCount; i++){
    const currentPair = getProcessedPair();
    lRoadPairs[i] = currentPair;
    unionFindL.uniteSets(currentPair[0], currentPair[1]);
  }

  const processedRoadPairs = new Set();

  for(let i = 0; i < kConnectionsCount; i++){
    const currentPair = kRoadPairs[i];
    if(unionFindL.areElementsConnected(currentPair[0], currentPair[1])){
      connectionCounts[currentPair[0]]++;
      connectionCounts[currentPair[1]]++;
    }
    processedRoadPairs.add(currentPair.join(":"));
  }

  for(let i = 0; i < lConnectionsCount; i++){
    const currentPair = lRoadPairs[i];
    if(processedRoadPairs.has(currentPair.join(":"))){
      continue;
    }
    if(unionFindK.areElementsConnected(currentPair[0], currentPair[1])){
      connectionCounts[currentPair[0]]++;
      connectionCounts[currentPair[1]]++;
    }
  }
  printResult(dataConverter(connectionCounts, 8));
}

class UnionFindStructure {
  constructor(size) {
    this.parentOrSizeArray = new Array(size).fill(-1);
  }

  areElementsConnected(elementA, elementB) {
    return this.findSetRoot(elementA) === this.findSetRoot(elementB);
  }

  findSetRoot(elementIndex) {
    if (this.parentOrSizeArray[elementIndex] < 0) {
      return elementIndex;
    } else {
      this.parentOrSizeArray[elementIndex] = this.findSetRoot(this.parentOrSizeArray[elementIndex]);
      return this.parentOrSizeArray[elementIndex];
    }
  }

  uniteSets(elementA, elementB) {
    let rootA = this.findSetRoot(elementA);
    let rootB = this.findSetRoot(elementB);

    if (!this.areElementsConnected(rootA, rootB)) {
      if (rootA >= rootB) {
        this.parentOrSizeArray[rootA] += this.parentOrSizeArray[rootB];
        this.parentOrSizeArray[rootB] = rootA;
      } else {
        this.parentOrSizeArray[rootB] += this.parentOrSizeArray[rootA];
        this.parentOrSizeArray[rootA] = rootB;
      }
    }
  }

  getSetSize(elementIndex) {
    return -this.parentOrSizeArray[this.findSetRoot(elementIndex)];
  }
}
