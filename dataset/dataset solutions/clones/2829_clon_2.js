var INPUT_PARSER=(function(){
  // Factory function to create an input reader instance
  function createParser(inputString){
    return new InputReader(inputString);
  }

  // Constructor for the InputReader object
  function InputReader(rawContent){
    // Store lines, trimming and splitting by newline
    this._lines=rawContent.trim().split("\n");
    // Initialize current line index
    this._currentLineIndex=0;
  }

  // Method to read a single token from the current line
  InputReader.prototype.readNextToken=function(asString){
    var lineData=this._lines,
        currentIdx=this._currentLineIndex,
        tokenValue;

    // If the current line hasn't been split into tokens yet, do so
    if(typeof lineData[currentIdx]==="string") {
      lineData[currentIdx]=lineData[currentIdx].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order due to reverse)
    tokenValue=lineData[currentIdx].pop();

    // If the current line is exhausted, advance to the next line
    if(!lineData[currentIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on 'asString' flag
    return asString ? tokenValue : +tokenValue;
  };

  // Method to read all tokens from the current line
  InputReader.prototype.readLineTokens=function(returnStrings){
    var lineTokens=this._lines[this._currentLineIndex++].split(" ");
    // Return as strings or numbers based on 'returnStrings' flag
    return returnStrings ? lineTokens : lineTokens.map(itemStr=>+itemStr);
  };

  // Method to read a matrix of 'numRows' rows
  InputReader.prototype.readMatrix=function(numRows,keepStrings){
    var matrixRows=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=numRows).map(rowStr=>rowStr.split(" "));
    // Return as strings or numbers based on 'keepStrings' flag
    return keepStrings ? matrixRows : matrixRows.map(rowStr=>rowStr.map(itemStr=>+itemStr));
  };

  // Method to read 'count' lines
  InputReader.prototype.readLines=function(count,asStrings){
    var selectedLines=this._lines.slice(this._currentLineIndex,this._currentLineIndex+=count);
    // Return as strings or numbers based on 'asStrings' flag
    return asStrings ? selectedLines : selectedLines.map(lineContent=>+lineContent);
  };

  return createParser;
})();

// Initialize the input source by reading from stdin
var inputSource=INPUT_PARSER(require("fs").readFileSync("/dev/stdin","utf8"));

// Helper function to create multi-dimensional arrays
function createMultiDimArray(initialValue){
  var argsList=arguments,
      argLength=argsList.length,
      arrayCreationCode="Array(argsList["+ --argLength +"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--argLength) {
    arrayCreationCode="Array(argsList["+argLength+"]).fill(0).map(x=>"+arrayCreationCode+")";
  }
  return eval(arrayCreationCode);
}

// Define a modulo constant
var moduloConstant=1e9+7;

// Output the result of the main problem-solving function
console.log(solveProblem());

// Main function to solve the problem
function solveProblem(){
  // Read input values
  var firstInputSize=inputSource.readNextToken();
  var secondInputSize=inputSource.readNextToken();
  var sequenceA=inputSource.readLineTokens();
  var sequenceB=inputSource.readLineTokens();

  // Initialize a 2D DP table with zeros
  var dynamicProgrammingTable=createMultiDimArray(0,firstInputSize+1,secondInputSize+1);
  // Initialize the total subsequences count
  var totalSubsequences=1;

  // Iterate through sequence A
  for(var idxA=0;idxA<firstInputSize;idxA++){
    // Iterate through sequence B
    for(var idxB=0;idxB<secondInputSize;idxB++){
      // If characters match, update total subsequences and DP table
      if(sequenceA[idxA]===sequenceB[idxB]){
        totalSubsequences=(totalSubsequences+dynamicProgrammingTable[idxA][idxB]+1)%moduloConstant;
        dynamicProgrammingTable[idxA+1][idxB+1]=(dynamicProgrammingTable[idxA+1][idxB]+dynamicProgrammingTable[idxA][idxB+1]+1)%moduloConstant;
      } else {
        // If characters don't match, update DP table using inclusion-exclusion principle
        dynamicProgrammingTable[idxA+1][idxB+1]=(dynamicProgrammingTable[idxA+1][idxB]+dynamicProgrammingTable[idxA][idxB+1]-dynamicProgrammingTable[idxA][idxB])%moduloConstant;
      }
      // Ensure DP table value remains positive after modulo operation
      if (dynamicProgrammingTable[idxA+1][idxB+1] < 0) {
        dynamicProgrammingTable[idxA+1][idxB+1] += moduloConstant;
      }
    }
  }
  // Return the final count of subsequences
  return totalSubsequences;
}
