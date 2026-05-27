var inputParserFactory=(function(){
  function createParser(sourceString){
    return new InputParser(sourceString);
  }

  function InputParser(sourceString){
    this._lines=sourceString.trim().split("\n");
    this._currentLineIndex=0;
  }

  InputParser.prototype.readNextValue=function(asString){
    var currentLineTokens=this._lines[this._currentLineIndex];
    var extractedValue;

    if(typeof currentLineTokens==="string"){
      currentLineTokens=currentLineTokens.split(" ").reverse();
      this._lines[this._currentLineIndex]=currentLineTokens;
    }

    extractedValue=currentLineTokens.pop();

    if(!currentLineTokens.length){
      this._currentLineIndex++;
    }
    return asString ? extractedValue : +extractedValue;
  };

  InputParser.prototype.readLineValues=function(asStrings){
    var lineContent = this._lines[this._currentLineIndex++].split(" ");
    return asStrings ? lineContent : lineContent.map(val => +val);
  };

  InputParser.prototype.readMatrix=function(rowCount, asStrings){
    var matrixRows=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=rowCount).map(rowStr=>rowStr.split(" "));
    return asStrings ? matrixRows : matrixRows.map(row=>row.map(val=>+val));
  };

  InputParser.prototype.readRawLines=function(rowCount, asStrings){
    var rawLines=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=rowCount);
    return asStrings ? rawLines : rawLines.map(val=>+val);
  };

  return createParser;
})();

var parserInstance=inputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue){
  var dimensions=arguments,dimCount=dimensions.length,arrayCreationString="Array(dimensions["+--dimCount+"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--dimCount)arrayCreationString="Array(dimensions["+dimCount+"]).fill(0).map(x=>"+arrayCreationString+")";
  return eval(arrayCreationString);
}

console.log(main());

function main(){
  var itemCount = parserInstance.readNextValue();
  var operationCount = parserInstance.readNextValue();
  var itemsArray = parserInstance.readLineValues().sort((valA,valB)=>valA-valB);
  var operationsArray = parserInstance.readMatrix(operationCount);
  operationsArray.sort((opA,opB)=>opB[1]-opA[1]);

  var currentItemIndex = 0;

  const calculateArraySum = (arr) => arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  for(var opIdx = 0; opIdx < operationCount; opIdx++){
    const currentOperation = operationsArray[opIdx];
    const applyCount = currentOperation[0];
    const replacementValue = currentOperation[1];

    for(var countIdx = 0; countIdx < applyCount; countIdx++){
      // Guard clause: if we've processed all available items, sum up and exit.
      if (currentItemIndex >= itemCount) {
        return calculateArraySum(itemsArray);
      }

      if(itemsArray[currentItemIndex] < replacementValue){
        itemsArray[currentItemIndex] = replacementValue;
      } else {
        // Optimization: Since itemsArray is sorted, if the current item
        // is not less than the replacement value, no subsequent items
        // in this array will be less either. So, we can stop applying
        // this operation and sum up the current state of the array.
        return calculateArraySum(itemsArray);
      }
      currentItemIndex++;
    }
  }
  return calculateArraySum(itemsArray);
}
