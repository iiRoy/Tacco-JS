var INPUT_PROCESSOR=(function(){function createSourceHandler(sourceText){return new DataStream(sourceText);}function DataStream(textInput){this._lines=textInput.trim().split("\n");this._linePointer=0;}DataStream.prototype.retrieveSingle=function(returnRaw){var lineBuffer=this._lines,currentPosition=this._linePointer,extractedFragment;if(typeof lineBuffer[currentPosition]==="string")lineBuffer[currentPosition]=lineBuffer[currentPosition].split(" ").reverse();extractedFragment=lineBuffer[currentPosition].pop();if(!lineBuffer[currentPosition].length)this._linePointer++;return returnRaw?extractedFragment:+extractedFragment;};DataStream.prototype.obtainLine=function(asStrings){var tokens=this._lines[this._linePointer++].split(" ");return asStrings?tokens:tokens.map(entry=>+entry);};DataStream.prototype.getMatrix=function(rowsCount,stringFormat){var collectedMatrix=this._lines.slice(this._linePointer,this._linePointer+=rowsCount).map(row=>row.split(" "));return stringFormat?collectedMatrix:collectedMatrix.map(row=>row.map(item=>+item));};DataStream.prototype.getRows=function(itemCount,textFormat){var rowData=this._lines.slice(this._linePointer,this._linePointer+=itemCount);return textFormat?rowData:rowData.map(val=>+val);};return createSourceHandler;})();
var dataReader=INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin","utf8"));
function generateNestedArray(fillValue){var dimensionArguments=arguments,argumentCount=dimensionArguments.length,codeString="Array(dimensionArguments["+ --argumentCount+"]).fill(0).map(element => {return "+fillValue+";})";while(--argumentCount)codeString="Array(dimensionArguments["+argumentCount+"]).fill(0).map(element => "+codeString+")";return eval(codeString);}
var itemTotal,sourceSequence,statusTracker;
console.log(processMainLogic());
function processMainLogic(){
itemTotal=dataReader.retrieveSingle();
sourceSequence=dataReader.obtainLine();
sourceSequence.sort((valA,valB)=>valB-valA);
statusTracker=generateNestedArray(0,1<<itemTotal);
statusTracker[0]=1;
return exploreStates([[sourceSequence[0],1]])?"Yes":"No";
}
function exploreStates(currentExplorationQueue){
var currentQueueSize=currentExplorationQueue.length;
var trackerCapacity=statusTracker.length;
if(currentQueueSize===statusTracker.length)return 1;
var newExplorationQueue=currentExplorationQueue.concat(),searchPointer=1;
for(var queueIndex=0;queueIndex<currentQueueSize;queueIndex++){
if(searchPointer<currentExplorationQueue[queueIndex][1])
searchPointer=currentExplorationQueue[queueIndex][1];
for(;searchPointer<trackerCapacity;searchPointer++){
if(statusTracker[searchPointer])continue;
if(sourceSequence[searchPointer]<currentExplorationQueue[queueIndex][0])break;
}
if(searchPointer===trackerCapacity)return 0;
statusTracker[searchPointer]=1;
newExplorationQueue.push([sourceSequence[searchPointer],++searchPointer]);
}
return exploreStates(newExplorationQueue.sort((itemA,itemB)=>itemB[0]-itemA[0]));
}