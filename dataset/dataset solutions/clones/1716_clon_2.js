const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let parsedContent;
let incomingLines = [];

inputProcessor.on('line', function(singleLine){
    incomingLines.push(singleLine);
});

inputProcessor.on('close', function(){
    parsedContent = setupInput(incomingLines);
    console.error("\n");

    const timerBegin = new Date();
    executePrimaryLogic();
    const elapsedTime = new Date() - timerBegin;
    
    reportDebug("Execution Duration: " + (elapsedTime) + "ms");
    reportDebug("Memory Usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function obtainNumber(){ return transformData(fetchNext(), 1); }
function obtainTextSegments(){ return transformData(fetchNext(), 2); }
function obtainNumbersList(){ return transformData(fetchNext(), 4); }
function obtainCharElements(){ return transformData(fetchNext(), 6); }
function fetchNext(){ return parsedContent.fetchNext(); }
function hasMoreData(){ return parsedContent.hasMoreData(); }

function setupInput(rawInput){  
    const dataAccessor = {
        sourceLines : rawInput,
        lineIndex : 0,
        totalLines : rawInput.length,
        hasMoreData : function(){ return (this.lineIndex < this.totalLines); },
        fetchNext : function(){
            if(!this.hasMoreData()){
                throw "EndOfInputException: No more lines to process";
            } else {
                const extractedText = this.sourceLines[this.lineIndex];
                this.lineIndex++;
                return extractedText;
            }
        }
    };
    return dataAccessor;
}

function displayOutput(message){ console.log(message); }
function reportDebug(debugInfo){ console.error("debug trace: " + require("util").inspect(debugInfo, false, null)); }

function transformData(inputVal, processType){
    try {
        switch(processType){
            case 1: return parseInt(inputVal);
            case 2: return inputVal.split(" ");
            case 4: return inputVal.split(" ").map(Number);
            case 6: return inputVal.split("");
            case 7: return inputVal.split("").map(Number);
            case 8: return inputVal.join(" ");
            case 9: return inputVal.join("\n");
            case 0: return inputVal.join("");
            default: return inputVal;
        }
    } catch(e){
        return inputVal;
    }
}

function executePrimaryLogic(){
    const totalPeriods = obtainNumber();
    const costCoefficients = obtainNumbersList();
    const cumulativeValues = new Array(totalPeriods);
    const lastActivityDay = new Array(26).fill(0);

    for(let dayNum = 1; dayNum <= totalPeriods; dayNum++){
        const currentDayScores = obtainNumbersList();
        let highestScore = -1;
        let bestActivityId = -1;

        for(let activityIdx = 0; activityIdx < currentDayScores.length; activityIdx++){
            if(highestScore < currentDayScores[activityIdx]){
                highestScore = currentDayScores[activityIdx];
                bestActivityId = activityIdx;
            }
        }

        lastActivityDay[bestActivityId] = dayNum;

        for(let activityIdx = 0; activityIdx < 26; activityIdx++){
            highestScore -= costCoefficients[activityIdx] * (dayNum - lastActivityDay[activityIdx]);
        }

        if(dayNum === 1){
            cumulativeValues[dayNum - 1] = highestScore;
        } else {
            cumulativeValues[dayNum - 1] = highestScore + cumulativeValues[dayNum - 2];
        }
        reportDebug(highestScore);
    }
    displayOutput(transformData(cumulativeValues, 9));
}