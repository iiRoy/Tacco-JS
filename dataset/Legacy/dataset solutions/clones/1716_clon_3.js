var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var bufferedLines = [];

lineReader.on('line', function(inputLine){
  bufferedLines.push(inputLine);
});

lineReader.on('close', function(){
  dataHandler = createDataHandler(bufferedLines);
  console.error("\n");
  var executionStartTime = new Date();
  runMainSimulation();
  var durationMs = new Date() - executionStartTime;
  
  logErrorDetails("time : " + (durationMs) + "ms");
  logErrorDetails("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function getNextInt(){ return applyConversion(getNextInputToken(), 1); }
function getNextStrArray(){ return applyConversion(getNextInputToken(), 2); }
function getNextIntArray(){ return applyConversion(getNextInputToken(), 4); }
function getNextCharArray(){ return applyConversion(getNextInputToken(), 6); }
function getNextInputToken(){ return dataHandler.getNext(); }
function hasMoreInput(){ return dataHandler.hasMore(); }

function createDataHandler(inputDataLines){  
  var handlerInstance = {
    lineList : inputDataLines,
    currentIndex : 0,
    maxLines : inputDataLines.length,
    
    hasMore : function(){
      return (this.currentIndex < this.maxLines);
    },
    
    getNext : function(){
      if(!this.hasMore()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.lineList[this.currentIndex];
        this.currentIndex++;
        return currentInputLine;
      }
    }
  };
  return handlerInstance;
}

function outputResult(messageContent){ console.log(messageContent); }
function logErrorDetails(messageContent){ console.error("debug:" + require("util").inspect(messageContent,false,null)); }

const conversionFunctions = {
    1: parseInt,
    2: (item) => item.split(" "),
    4: (item) => item.split(" ").map(Number),
    6: (item) => item.split(""),
    7: (item) => item.split("").map(Number),
    8: (item) => item.join(" "),
    9: (item) => item.join("\n"),
    0: (item) => item.join("")
};

function applyConversion(inputItem, conversionMode){
  try {
    const converter = conversionFunctions[conversionMode];
    if (converter) {
        return converter(inputItem);
    }
    return inputItem;
  } catch(e){
    return inputItem;
  }
}

function findMaxScoreAndIndex(scoresArray) {
    let highestScore = -1;
    let bestIndex = -1;
    for (let k = 0; k < scoresArray.length; k++) {
        const currentScore = scoresArray[k];
        if (highestScore < currentScore) {
            highestScore = currentScore;
            bestIndex = k;
        }
    }
    return { score: highestScore, index: bestIndex };
}

function runMainSimulation(){
    const NUM_CONTEST_TYPES = 26;
    var totalDays = getNextInt();
    var satisfactionDecayRates = getNextIntArray();
    var cumulativeSatisfaction = new Array(totalDays);
    var lastContestDayByType = new Array(NUM_CONTEST_TYPES).fill(0);

    for(var currentDayIteration = 1; currentDayIteration <= totalDays; currentDayIteration++){
        var dailyContestScores = getNextIntArray();
        
        const { score: highestScoreToday, index: bestContestTypeIndex } = findMaxScoreAndIndex(dailyContestScores);

        lastContestDayByType[bestContestTypeIndex] = currentDayIteration;

        let adjustedScoreForDay = highestScoreToday;
        let totalDecayFromRates = 0;

        for(var contestTypeIterator = 0; contestTypeIterator < NUM_CONTEST_TYPES; contestTypeIterator++){
            const daysSinceLastContest = currentDayIteration - lastContestDayByType[contestTypeIterator];
            const decayAmount = satisfactionDecayRates[contestTypeIterator] * daysSinceLastContest;
            totalDecayFromRates += decayAmount;
        }
        adjustedScoreForDay -= totalDecayFromRates;

        if(currentDayIteration === 1){
            cumulativeSatisfaction[currentDayIteration - 1] = adjustedScoreForDay;
        } else {
            const previousDayCumulative = cumulativeSatisfaction[currentDayIteration - 2];
            cumulativeSatisfaction[currentDayIteration - 1] = adjustedScoreForDay + previousDayCumulative;
        }
        
        logErrorDetails(adjustedScoreForDay);
    }
    outputResult(applyConversion(cumulativeSatisfaction, 9));
}
