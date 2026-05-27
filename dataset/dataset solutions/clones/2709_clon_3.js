var InputParserFactory=(function(){function createInputParser(rawInputString){return new InputParser(rawInputString);}function convertToNumbers(stringArray){return stringArray.map(val=>Number(val));}function InputParser(inputContent){this.sourceLines=inputContent.trim().split("\n");this.currentLineIdx=0;}InputParser.prototype.readNextToken=function(asString){const lines=this.sourceLines;let lineIndex=this.currentLineIdx;let currentLineTokens=lines[lineIndex];if(typeof currentLineTokens==="string"){lines[lineIndex]=currentLineTokens.split(" ").reverse();}const token=lines[lineIndex].pop();if(!lines[lineIndex].length){this.currentLineIdx++;}return asString?token:Number(token);};InputParser.prototype.readCurrentLine=function(asStrings){const lineTokens=this.sourceLines[this.currentLineIdx++].split(" ");return asStrings?lineTokens:convertToNumbers(lineTokens);};InputParser.prototype.readMatrixLines=function(count,asStrings){const matrixRows=this.sourceLines.slice(this.currentLineIdx,this.currentLineIdx+=count).map(line=>line.split(" "));return asStrings?matrixRows:matrixRows.map(row=>convertToNumbers(row));};InputParser.prototype.readRawLines=function(count,asStrings){const rawLines=this.sourceLines.slice(this.currentLineIdx,this.currentLineIdx+=count);return asStrings?rawLines:convertToNumbers(rawLines);};return createInputParser;})();
var inputReader=InputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));
function createMultiDimArray(initialValue){var args=arguments,numArgs=args.length,expression="Array.from({ length: args["+--numArgs+"] }, () => { return "+initialValue+"; })";while(--numArgs)expression="Array.from({ length: args["+numArgs+"] }, () => "+expression+")";return eval(expression);}
var stepMagnitude,targetXCoord,targetYCoord,currentXCoord=0,currentYCoord=0;

console.log(processMovement());

function calculateManhattanDistance(a,b){
  return Math.abs(a-targetXCoord)+Math.abs(b-targetYCoord);
}
function getDirectionSign(from,to){
  var difference=from-to;
  if(difference>0)return 1;
  if(difference<0)return -1;
  return 0;
}
function moveCoordinateTowardsTarget(current,target,budget){
  const diff=target-current;
  const absDiff=Math.abs(diff);
  const direction=diff>0?1:-1;
  if(budget>=absDiff){
    return {newCoord:target,remainingBudget:budget-absDiff};
  }else{
    return {newCoord:current+(budget*direction),remainingBudget:0};
  }
}
function takeStep(){
  let remainingStepBudget=stepMagnitude;
  const xMoveResult=moveCoordinateTowardsTarget(currentXCoord,targetXCoord,remainingStepBudget);
  currentXCoord=xMoveResult.newCoord;
  remainingStepBudget=xMoveResult.remainingBudget;
  if(remainingStepBudget>0){
    if(targetYCoord<currentYCoord){
      currentYCoord-=remainingStepBudget;
    }else{
      currentYCoord+=remainingStepBudget;
    }
    remainingStepBudget=0;
  }
  return currentXCoord+" "+currentYCoord;
}
function calculateAdjustedPartialStep(currentManhattanDistance,totalStepSize){
  let partialStep=(currentManhattanDistance%totalStepSize)/2;
  if(totalStepSize%2===0){
    partialStep=totalStepSize-partialStep;
  }
  return partialStep;
}
function processMovement(){
  stepMagnitude=inputReader.readNextToken();
  targetXCoord=inputReader.readNextToken();
  targetYCoord=inputReader.readNextToken();

  const ZERO_COORDS=0;
  const IMPOSSIBLE_PATH=-1;

  if(targetXCoord===0&&targetYCoord===0){
    return ZERO_COORDS;
  }
  if(stepMagnitude%2===0&&(targetXCoord+targetYCoord)%2!==0){
    return IMPOSSIBLE_PATH;
  }

  const movementPath=[];
  let initialManhattanDistance=calculateManhattanDistance(0,0);

  if(initialManhattanDistance%stepMagnitude!==0){
    if((initialManhattanDistance%stepMagnitude)%2===1){
      movementPath.push(takeStep());
    }
    const partialStepValue=calculateAdjustedPartialStep(
      calculateManhattanDistance(currentXCoord,currentYCoord),
      stepMagnitude
    );
    const complementaryStepValue=stepMagnitude-partialStepValue;

    const currentXDiff=Math.abs(currentXCoord-targetXCoord);

    if(currentXDiff>=partialStepValue){
      if(currentXCoord<targetXCoord){
        currentXCoord+=partialStepValue;
      }else{
        currentXCoord-=partialStepValue;
      }
      if(currentYCoord<targetYCoord){
        currentYCoord-=complementaryStepValue;
      }else{
        currentYCoord+=complementaryStepValue;
      }
    }else{
      if(currentYCoord<targetYCoord){
        currentYCoord+=partialStepValue;
      }else{
        currentYCoord-=partialStepValue;
      }
      if(currentXCoord<targetXCoord){
        currentXCoord-=complementaryStepValue;
      }else{
        currentXCoord+=complementaryStepValue;
      }
    }
    movementPath.push(currentXCoord+" "+currentYCoord);
  }
  while(calculateManhattanDistance(currentXCoord,currentYCoord)>0){
    movementPath.push(takeStep());
  }
  console.log(movementPath.length);
  return movementPath.join("\n");
}
