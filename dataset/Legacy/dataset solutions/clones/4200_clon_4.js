var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputState; var inputLines = [];
read.on('line', function(input){inputLines.push(input);});
read.on('close', function(){
  inputState = initializeInputReader(inputLines);
  console.error('\n↑入力 ↓出力');
  processChannelActivity();
});

function deepCopy(data){return (data instanceof Set) ? new Set(Array.from(data)) : JSON.parse(JSON.stringify(data));}
function readInteger(){return convertInput(getNextInputLine(),1);}
function readStringArray(){return convertInput(getNextInputLine(),2);}
function readIntegerArray(){return convertInput(getNextInputLine(),4);}
function readCharacterArray(){return convertInput(getNextInputLine(),6);}
function getNextInputLine(){return inputState.next();}
function hasMoreInput(){return inputState.hasNext();}

function initializeInputReader(lines){  
  return {
    dataLines : lines, currentIdx : 0, totalLines : lines.length,
    hasNext : function(){return (this.currentIdx < this.totalLines);},
    next : function(){if(this.hasNext()){return this.dataLines[this.currentIdx++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function printResult(content){console.log(content);}
function printDebug(content){console.error('debug:' + require('util').inspect(content,false,null));}

function convertInput(item, conversionType){
  try{
    switch(conversionType){
      case 1:return parseInt(item);
      case 2:return item.split(' ');
      case 4:return item.split(' ').map(Number);
      case 6:return item.split('');
      case 7:return item.split('').map(Number);
      case 8:return item.join(' ');
      case 9:return item.join('\n');
      case 0:return item.join('');
      default:return item;
    }
  }catch(e){
    return item;
  }
}

function processChannelActivity(){
  var firstLineData = readIntegerArray();
  var eventCount = firstLineData[0];
  var channelCapacity = firstLineData[1];

  var allEvents = [];

  for(var i = 0; i < eventCount; i++){
    var eventDetails = readIntegerArray();
    var startTime = eventDetails[0];
    var endTime = eventDetails[1];
    var channelIdentifier = eventDetails[2];

    allEvents.push({ time: startTime - 1, type: 'add', channelId: channelIdentifier });
    allEvents.push({ time: endTime, type: 'remove', channelId: channelIdentifier });
  }

  allEvents.sort((eventA, eventB) => {
    if (eventA.time !== eventB.time) {
      return eventA.time - eventB.time;
    }
    const typePriority = { 'remove': -1, 'add': 1 };
    return typePriority[eventA.type] - typePriority[eventB.type];
  });

  var currentlyActiveChannels = new Set();
  var peakActiveCount = 0;
  var lastProcessedTime = -1;

  for(var k = 0; k < allEvents.length; k++){
    var currentEvent = allEvents[k];

    if (currentEvent.time !== lastProcessedTime) {
      peakActiveCount = Math.max(peakActiveCount, currentlyActiveChannels.size);
      lastProcessedTime = currentEvent.time;
    }

    if (currentEvent.type === 'add') {
      currentlyActiveChannels.add(currentEvent.channelId);
    } else {
      currentlyActiveChannels.delete(currentEvent.channelId);
    }
  }

  peakActiveCount = Math.max(peakActiveCount, currentlyActiveChannels.size);

  printResult(peakActiveCount);
}
