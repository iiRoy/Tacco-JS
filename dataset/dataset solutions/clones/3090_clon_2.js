var INPUT_PARSER=(function(){
  function createInputReader(rawInputText){
    return new InputReader(rawInputText);
  }
  function InputReader(sourceContent) {
    this.lineSegments = sourceContent.trim().split("\n");
    this.currentLineIndex = 0;
  }
  InputReader.prototype.fetchScalar=function(returnAsString){
    var segmentsRef = this.lineSegments,
        lineIdx = this.currentLineIndex,
        itemValue;
    if(typeof segmentsRef[lineIdx] === "string")
      segmentsRef[lineIdx] = segmentsRef[lineIdx].split(" ").reverse();
    itemValue = segmentsRef[lineIdx].pop();
    if(!segmentsRef[lineIdx].length)
      this.currentLineIndex++;
    return returnAsString ? itemValue : +itemValue;
  };
  InputReader.prototype.fetchLine=function(keepStrings){
    var lineItems = this.lineSegments[this.currentLineIndex++].split(" ");
    return keepStrings ? lineItems : lineItems.map(val => +val);
  };
  InputReader.prototype.fetchMatrix=function(rowCount,preserveStrings){
    var matrixData = this.lineSegments.slice(this.currentLineIndex, this.currentLineIndex += rowCount).map(line => line.split(" "));
    return preserveStrings ? matrixData : matrixData.map(row => row.map(cell => +cell));
  };
  InputReader.prototype.fetchRows=function(numRows,asStrings){
    var rowContent = this.lineSegments.slice(this.currentLineIndex, this.currentLineIndex += numRows);
    return asStrings ? rowContent : rowContent.map(val => +val);
  };
  return createInputReader;
})();
var inputProcessor = INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));
function buildMultiDimensionalArray(initialValue){
  var dimArguments=arguments,
      argCount=dimArguments.length,
      arrayCreationString="Array(dimArguments["+--argCount+"]).fill(initialValue)";
  while(--argCount)
    arrayCreationString="Array(dimArguments["+argCount+"]).fill(0).map(_=>"+arrayCreationString+")";
  return eval(arrayCreationString);
}
var primeModulo = 1e9 + 7;
function multiplyModulo(){
  for(var factorList=arguments,runningProduct=factorList[0],factorIndex=1;factorIndex<factorList.length;)
    runningProduct=((runningProduct>>16)*factorList[factorIndex]%primeModulo*65536+(runningProduct&65535)*factorList[factorIndex++])%primeModulo;
  return runningProduct;
}

console.log(executeSolution());
function executeSolution(){
  var totalElements = inputProcessor.fetchScalar();
  var initialValue = inputProcessor.fetchScalar();
  var sortedDivisors = inputProcessor.fetchLine().sort((valA,valB)=>valB-valA);
  var currentProbabilityMap = {};
  currentProbabilityMap[initialValue] = 1;
  for(var elementIndex = 0; elementIndex < totalElements; elementIndex++){
    var nextProbabilityMap = {};
    for(var currentKey in currentProbabilityMap){
      currentKey = +currentKey;
      if(nextProbabilityMap[currentKey])
        nextProbabilityMap[currentKey] += currentProbabilityMap[currentKey] * (totalElements-elementIndex-1), nextProbabilityMap[currentKey] %= primeModulo;
      else
        nextProbabilityMap[currentKey] = currentProbabilityMap[currentKey]*(totalElements-elementIndex-1) % primeModulo;
      var remainderKey = currentKey % sortedDivisors[elementIndex];
      if(nextProbabilityMap[remainderKey])
        nextProbabilityMap[remainderKey] += currentProbabilityMap[currentKey], nextProbabilityMap[remainderKey] %= primeModulo;
      else
        nextProbabilityMap[remainderKey] = currentProbabilityMap[currentKey];
    }
    currentProbabilityMap = nextProbabilityMap;
  }
  var finalResult = 0;
  for(var mapEntry in currentProbabilityMap){
    mapEntry = +mapEntry;
    finalResult += multiplyModulo(mapEntry,currentProbabilityMap[mapEntry]);
  }
  return finalResult % primeModulo;
}