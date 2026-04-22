var TEXT_PROCESSOR=(function(){
  function buildProcessor(sourceText){
    return new SourceReader(sourceText);
  }
  function SourceReader(rawText){
    this._textSegments=rawText.trim().split("\n");
    this._linePointer=0;
  }
  SourceReader.prototype.extractValue=function(isTextMode){
    var dataSegments=this._textSegments,
        currentIdx=this._linePointer,
        outputChunk;
    if(typeof dataSegments[currentIdx]==="string")
      dataSegments[currentIdx]=dataSegments[currentIdx].split(" ").reverse();
    outputChunk=dataSegments[currentIdx].pop();
    if(!dataSegments[currentIdx].length)
      this._linePointer++;
    return isTextMode?outputChunk:+outputChunk;
  };
  SourceReader.prototype.fetchLine=function(isTextMode){
    var extractedData=this._textSegments[this._linePointer++].split(" ");
    return isTextMode?extractedData:extractedData.map(val=>+val);
  };
  SourceReader.prototype.getMatrixData=function(rowsToRead,isTextMode){
    var resultMatrix=this._textSegments.slice(this._linePointer,this._linePointer+=rowsToRead).map(val=>val.split(" "));
    return isTextMode?resultMatrix:resultMatrix.map(val=>val.map(val=>+val));
  };
  SourceReader.prototype.getRawLines=function(rowsToRead,isTextMode){
    var rawLinesChunk=this._textSegments.slice(this._linePointer,this._linePointer+=rowsToRead);
    return isTextMode?rawLinesChunk:rawLinesChunk.map(val=>+val);
  };
  return buildProcessor;
})();
var streamProcessor=TEXT_PROCESSOR(require("fs").readFileSync("/dev/stdin","utf8"));
function makeMultiArray(fillValue){
  var dimensions=arguments,
      currentDim=dimensions.length,
      codeToEval="Array(dimensions["+ --currentDim+"]).fill(0).map(x=>{return "+fillValue+";})";
  while(--currentDim)
    codeToEval="Array(dimensions["+currentDim+"]).fill(0).map(x=>"+codeToEval+")";
  return eval(codeToEval);
}
function binarySearchCeiling(collection,lowIdx,highIdx,valueToFind){
  for(var pivotIdx;1<highIdx-lowIdx;)
    collection[pivotIdx=0|(lowIdx+highIdx)/2]<=valueToFind?lowIdx=pivotIdx:highIdx=pivotIdx;
  return collection[lowIdx]<=valueToFind?highIdx:lowIdx
};

console.log(runSolution());
function runSolution(){
  var dataSize=streamProcessor.extractValue();
  var numericSequence=streamProcessor.getRawLines(dataSize);
  var lisSequence=[1];
  for(var idx=0;idx<dataSize;idx++){
    var currentNegatedValue=-numericSequence[idx];
    var insertionPoint=binarySearchCeiling(lisSequence,0,lisSequence.length,currentNegatedValue);
    lisSequence[insertionPoint]=currentNegatedValue;
  }
  return lisSequence.length;
}