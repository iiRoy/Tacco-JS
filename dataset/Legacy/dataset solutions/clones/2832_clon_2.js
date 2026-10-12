var InputParserFactory = (function () {
  function createInputProcessor(inputStringContent) {
    return new InputProcessor(inputStringContent);
  }

  function InputProcessor(rawContent) {
    this.lineSegments = rawContent.trim().split("\n");
    this.currentLineIndex = 0;
  }

  InputProcessor.prototype.extractNextValue = function (asString) {
    var lineData = this.lineSegments,
      idx = this.currentLineIndex,
      extractedToken;

    if (typeof lineData[idx] === "string") {
      lineData[idx] = lineData[idx].split(" ").reverse();
    }

    extractedToken = lineData[idx].pop();

    if (!lineData[idx].length) {
      this.currentLineIndex++;
    }

    return asString ? extractedToken : +extractedToken;
  };

  InputProcessor.prototype.readNextLine = function (keepStrings) {
    var lineTokens = this.lineSegments[this.currentLineIndex++].split(" ");
    return keepStrings ? lineTokens : lineTokens.map((valStr) => +valStr);
  };

  InputProcessor.prototype.readMatrix = function (numRows, returnAsStrings) {
    var matrixRows = this.lineSegments
      .slice(this.currentLineIndex, (this.currentLineIndex += numRows))
      .map((rowStr) => rowStr.split(" "));
    return returnAsStrings
      ? matrixRows
      : matrixRows.map((rowStr) => rowStr.map((cellStr) => +cellStr));
  };

  InputProcessor.prototype.readLines = function (count, asRawStrings) {
    var selectedLines = this.lineSegments.slice(
      this.currentLineIndex,
      (this.currentLineIndex += count)
    );
    return asRawStrings ? selectedLines : selectedLines.map((lineVal) => +lineVal);
  };

  return createInputProcessor;
})();

var inputReader = InputParserFactory(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argCount = argsList.length,
    arrayCreationCode =
      "Array(argsList[" +
      --argCount +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--argCount) {
    arrayCreationCode =
      "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

var moduloConstant = 1000000007;

console.log(calculateLongestCommonSubsequence());

function calculateLongestCommonSubsequence() {
  var sequenceALength = inputReader.extractNextValue();
  var sequenceBLength = inputReader.extractNextValue();
  var sequenceA = inputReader.readNextLine();
  var sequenceB = inputReader.readNextLine();
  var dynamicProgrammingTable = createMultiDimArray(
    0,
    sequenceALength + 1,
    sequenceBLength + 1
  );
  var totalSubsequences = 1;

  for (var idxA = 0; idxA < sequenceALength; idxA++) {
    var currentMatchSum = 0;
    for (var idxB = 0; idxB < sequenceBLength; idxB++) {
      if (sequenceA[idxA] === sequenceB[idxB]) {
        currentMatchSum += dynamicProgrammingTable[idxA][idxB] + 1;
        totalSubsequences += dynamicProgrammingTable[idxA][idxB] + 1;
        totalSubsequences %= moduloConstant;
        dynamicProgrammingTable[idxA + 1][idxB + 1] =
          dynamicProgrammingTable[idxA + 1][idxB] +
          dynamicProgrammingTable[idxA][idxB + 1] +
          1;
      } else {
        dynamicProgrammingTable[idxA + 1][idxB + 1] =
          currentMatchSum + dynamicProgrammingTable[idxA][idxB + 1];
      }
      dynamicProgrammingTable[idxA + 1][idxB + 1] %= moduloConstant;
    }
  }
  return totalSubsequences;
}
