var INPUT_PARSER=(function(){
  function createDataReader(sourceContent){
    return new LineStreamProcessor(sourceContent);
  }

  function LineStreamProcessor(sourceContent){
    this._lineSegments=sourceContent.trim().split("\n");
    this._currentLineIndex=0;
  }

  LineStreamProcessor.prototype.readSingleValue=function(returnRawString){
    var segments=this._lineSegments,
      lineIndex=this._currentLineIndex,
      extractedValue;

    if(typeof segments[lineIndex]==="string")
      segments[lineIndex]=segments[lineIndex].split(" ").reverse();

    extractedValue=segments[lineIndex].pop();

    if(!segments[lineIndex].length)
      this._currentLineIndex++;

    return returnRawString?extractedValue:+extractedValue;
  };

  LineStreamProcessor.prototype.readNextLine=function(returnRawString){
    var lineParts=this._lineSegments[this._currentLineIndex++].split(" ");
    return returnRawString?lineParts:lineParts.map(item=>+item);
  };

  LineStreamProcessor.prototype.readMatrix=function(numRows,returnRawString){
    var extractedRows=this._lineSegments
      .slice(this._currentLineIndex,this._currentLineIndex+=numRows)
      .map(row=>row.split(" "));

    return returnRawString?extractedRows:extractedRows.map(row=>row.map(item=>+item));
  };

  LineStreamProcessor.prototype.readRows=function(numRows,returnRawString){
    var extractedRows=this._lineSegments.slice(this._currentLineIndex,this._currentLineIndex+=numRows);
    return returnRawString?extractedRows:extractedRows.map(item=>+item);
  };

  return createDataReader;
})();

var dataProcessor=INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

function buildMultiDimArray(initialValue){
  var argumentsList=arguments,
    dimCount=argumentsList.length,
    arrayCreationString="Array(argumentsList["+--dimCount+"]).fill(0).map(x=>{return "+initialValue+";})";

  while(--dimCount)
    arrayCreationString="Array(argumentsList["+dimCount+"]).fill(0).map(x=>"+arrayCreationString+")";

  return eval(arrayCreationString);
}

console.log(executeProgram());

function executeProgram(){
  var firstOperand = dataProcessor.readSingleValue();
  var secondOperand = dataProcessor.readSingleValue();
  return Math.max(0,firstOperand-2*secondOperand);
}