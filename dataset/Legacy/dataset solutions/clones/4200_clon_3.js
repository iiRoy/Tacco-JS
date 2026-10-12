const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const inputLines = [];

inputReader.on('line', function(lineContent){
  inputLines.push(lineContent);
});

inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeMainLogic();
});

function createDeepClone(sourceObject){
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInt(){ return convertInput(getNextToken(), 1); }
function getNextStringArray(){ return convertInput(getNextToken(), 2); }
function getNextIntArray(){ return convertInput(getNextToken(), 4); }
function getNextCharArray(){ return convertInput(getNextToken(), 6); }

function getNextToken(){ return inputHandler.next(); }
function hasMoreInput(){ return inputHandler.hasNext(); }

function initializeInputProcessor(linesArray){  
  return {
    dataList : linesArray,
    currentIndex : 0,
    maxIndex : linesArray.length,
    hasNext : function(){
      return (this.currentIndex < this.maxIndex);
    },
    next : function(){
      if(this.hasNext()){
        return this.dataList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function outputResult(data){ console.log(data); }
function outputDebug(data){ console.error('debug:' + require('util').inspect(data, false, null)); }

function convertInput(item, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(item);
      case 2: return item.split(' ');
      case 4: return item.split(' ').map(Number);
      case 6: return item.split('');
      case 7: return item.split('').map(Number);
      case 8: return item.join(' ');
      case 9: return item.join('\n');
      case 0: return item.join('');
      default: return item;
    }
  } catch(e) {
    return item;
  }
}

function executeMainLogic(){
  const firstLineData = getNextIntArray();
  const numEvents = firstLineData[0];
  const maxChannelId = firstLineData[1]; 

  const maxTimePoint = 100005;
  
  const eventTimeline = Array.from({ length: maxTimePoint }, () => ({
    additions: [],
    removals: []
  }));

  for (let eventIndex = 0; eventIndex < numEvents; eventIndex++) {
    const currentEventDetails = getNextIntArray();
    const startTime = currentEventDetails[0];
    const endTime = currentEventDetails[1];
    const channelIdentifier = currentEventDetails[2];

    eventTimeline[startTime - 1].additions.push(channelIdentifier);
    eventTimeline[endTime].removals.push(channelIdentifier);
  }

  const activeChannels = new Set();
  let maxConcurrentChannels = 0;

  for (let currentTimePoint = 0; currentTimePoint < maxTimePoint; currentTimePoint++) {
    const currentPointEvents = eventTimeline[currentTimePoint];

    for (const channelToRemove of currentPointEvents.removals) {
      activeChannels.delete(channelToRemove);
    }

    for (const channelToAdd of currentPointEvents.additions) {
      activeChannels.add(channelToAdd);
    }
    
    maxConcurrentChannels = Math.max(maxConcurrentChannels, activeChannels.size);
  }

  outputResult(maxConcurrentChannels);
}
