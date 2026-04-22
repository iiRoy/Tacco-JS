const DataFetcher=(function(){
  function makeReader(inputString){
    return new TextSource(inputString);
  }
  function TextSource(inputString){
    this.contentLines = inputString.trim().split('\n');
    this.currentLineIndex = 0;
  }
  TextSource.prototype.extractToken=function(wantString){
    let currentLineTokens = this.contentLines, lineIdx = this.currentLineIndex, pulledItem;
    if(typeof currentLineTokens[lineIdx] === 'string')
      currentLineTokens[lineIdx] = currentLineTokens[lineIdx].split(' ').reverse();
    pulledItem = currentLineTokens[lineIdx].pop();
    if(!currentLineTokens[lineIdx].length)
      this.currentLineIndex++;
    return wantString ? pulledItem : +pulledItem;
  };
  TextSource.prototype.readWholeLine=function(returnStrings){
    const parts = this.contentLines[this.currentLineIndex++].split(' ');
    return returnStrings ? parts : parts.map(segment => +segment);
  };
  TextSource.prototype.readMultiLineMatrix=function(rowsCount,returnStringMatrix){
    let collectedRows = this.contentLines.slice(this.currentLineIndex,this.currentLineIndex+=rowsCount).map(row => row.split(' '));
    return returnStringMatrix ? collectedRows : collectedRows.map(row => row.map(item => +item));
  };
  TextSource.prototype.readLinesAsArray=function(linesToRead,returnStringArray){
    const pulledLines = this.contentLines.slice(this.currentLineIndex,this.currentLineIndex+=linesToRead);
    return returnStringArray ? pulledLines : pulledLines.map(line => +line);
  };
  return makeReader;
})();

const dataReader=DataFetcher(require('fs').readFileSync('/dev/stdin','utf8'));

function generateNestedArray(fillElement){
  const dimensionArguments=arguments;
  let totalDims=dimensionArguments.length;
  let evalString=`Array(dimensionArguments[${--totalDims}]).fill(fillElement)`;
  while(--totalDims)
    evalString=`Array(dimensionArguments[${totalDims}]).fill(0).map(_ => ${evalString})`;
  return eval(evalString);
}

console.log(solveProblem());
function solveProblem(){
  const inputSize=dataReader.extractToken();
  const patternString=dataReader.extractToken(1);
  let minimumChanges=9e9;
  const whiteRunningSum=generateNestedArray(0,inputSize+1);
  const blackRunningSum=generateNestedArray(0,inputSize+1);

  for(let idx=0;idx<inputSize;idx++){
    whiteRunningSum[idx+1]=whiteRunningSum[idx];
    if(patternString[idx]==='#')
      whiteRunningSum[idx+1]++;
  }
  for(let idx=inputSize-1;idx>=0;idx--){
    blackRunningSum[idx]=blackRunningSum[idx+1];
    if(patternString[idx]==='.')
      blackRunningSum[idx]++;
  }
  for(let idx=0;idx<=inputSize;idx++){
    const tempSum=whiteRunningSum[idx]+blackRunningSum[idx];
    if(tempSum<minimumChanges)
      minimumChanges=tempSum;
  }
  return minimumChanges;
}