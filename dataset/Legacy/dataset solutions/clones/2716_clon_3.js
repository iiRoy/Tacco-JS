function modularMultiply(a, b, c){
  return ((a>>16)*b%c*65536+(a&65535)*b)%c;
}

const InputParser = (function(){
  const convertToNumber = (value, asNumber) => asNumber ? +value : value;

  function createParser(sourceString){
    return new ParserInstance(sourceString);
  }

  function ParserInstance(sourceString){
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  function prepareLineForTokens(lineContent) {
    return lineContent.split(" ").reverse();
  }

  ParserInstance.prototype.readNextToken = function(asNumber){
    const lines = this._sourceLines;
    let lineIndex = this._currentLineIndex;

    if(typeof lines[lineIndex] === "string") {
      lines[lineIndex] = prepareLineForTokens(lines[lineIndex]);
    }

    const currentLineTokens = lines[lineIndex];
    const token = currentLineTokens.pop();

    if(!currentLineTokens.length) {
      this._currentLineIndex++;
    }
    return convertToNumber(token, asNumber);
  };

  ParserInstance.prototype.readLineTokens = function(asNumber){
    const lineContent = this._sourceLines[this._currentLineIndex++];
    const tokens = lineContent.split(" ");
    return asNumber ? tokens.map(val => +val) : tokens;
  };

  ParserInstance.prototype.readMatrix = function(numRows, asNumber){
    const startRowIndex = this._currentLineIndex;
    const endRowIndex = this._currentLineIndex += numRows;
    const matrixRows = this._sourceLines.slice(startRowIndex, endRowIndex);
    const parsedMatrix = matrixRows.map(rowStr => rowStr.split(" "));
    return asNumber ? parsedMatrix.map(row => row.map(val => +val)) : parsedMatrix;
  };

  ParserInstance.prototype.readLines = function(numLines, asNumber){
    const startRowIndex = this._currentLineIndex;
    const endRowIndex = this._currentLineIndex += numLines;
    const lines = this._sourceLines.slice(startRowIndex, endRowIndex);
    return asNumber ? lines.map(line => +line) : lines;
  };

  return createParser;
})();

const inputReader = InputParser(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue){
  const dimensions = arguments;
  let currentDimIndex = dimensions.length;
  let arrayConstructionString = `Array(dimensions[${--currentDimIndex}]).fill(0).map(x=>{return ${initialValue};})`;
  while(--currentDimIndex) {
    arrayConstructionString = `Array(dimensions[${currentDimIndex}]).fill(0).map(x=>${arrayConstructionString})`;
  }
  return eval(arrayConstructionString);
}

const StringHasher = (function(){
  const hashBases = [1009,1007];
  const hashMods = [1e9+7,1e9+9];
  const powerValues = [[],[]];
  const hashPrefixSums = [[],[]];
  let currentHashedStringLength;

  function createStringHasher(inputString){
    return new StringHasher(inputString);
  }

  function computeHashComponents(targetString) {
    const resultHashes = [];
    for(let j = 0; j < hashMods.length; j++){
      let currentHashValue = 0;
      const currentBase = hashBases[j];
      const currentMod = hashMods[j];
      for(let i = 0; i < targetString.length; i++){
        currentHashValue = modularMultiply(currentHashValue, currentBase, currentMod) + targetString.charCodeAt(i);
        if(currentHashValue >= currentMod) {
          currentHashValue -= currentMod;
        }
      }
      resultHashes.push(currentHashValue);
    }
    return resultHashes;
  }

  function getSubstringHash(leftIndex, rightIndex, hashComponentIndex){
    const currentMod = hashMods[hashComponentIndex];
    let subHash = hashPrefixSums[hashComponentIndex][rightIndex] - modularMultiply(hashPrefixSums[hashComponentIndex][leftIndex], powerValues[hashComponentIndex][rightIndex - leftIndex], currentMod);
    if(subHash < 0) {
      subHash += currentMod;
    }
    return subHash;
  }

  function StringHasher(inputString){
    currentHashedStringLength = this.size = inputString.length;
    for(let j = 0; j < hashMods.length; j++){
      const currentMod = hashMods[j];
      const currentBase = hashBases[j];

      powerValues[j].length = hashPrefixSums[j].length = currentHashedStringLength + 1;
      powerValues[j][0] = 1;
      hashPrefixSums[j][0] = 0;

      for(let i = 0; i < currentHashedStringLength; i++){
        powerValues[j][i+1] = modularMultiply(powerValues[j][i], currentBase, currentMod);
        hashPrefixSums[j][i+1] = modularMultiply(hashPrefixSums[j][i], currentBase, currentMod) + inputString.charCodeAt(i);
        if(hashPrefixSums[j][i+1] >= currentMod) {
          hashPrefixSums[j][i+1] -= currentMod;
        }
      }
    }
  }

  StringHasher.prototype.findSubstring = function(subString, searchStartIndex){
    const subStringHashComponents = computeHashComponents(subString);
    const subLength = subString.length;
    const numberOfHashComponents = hashMods.length;
    const maxPossibleSearchIndex = currentHashedStringLength - subLength + 1;
    let matchingComponentCount = 0;

    const effectiveStartIndex = searchStartIndex || 0;

    for(let i = effectiveStartIndex; i < maxPossibleSearchIndex; i++){
      const firstComponentHash = getSubstringHash(i, i + subLength, 0);
      if(firstComponentHash === subStringHashComponents[0]){
        matchingComponentCount = 1;
        for(let j = 1; j < numberOfHashComponents; j++){
          const currentComponentHash = getSubstringHash(i, i + subLength, j);
          if(currentComponentHash !== subStringHashComponents[j]) {
            break;
          }
          matchingComponentCount++;
        }
        if(matchingComponentCount === numberOfHashComponents) {
          return i;
        }
      }
    }
    return -1;
  };

  StringHasher.prototype.appendString = function(newStringSegment){
    const oldLength = currentHashedStringLength;
    currentHashedStringLength = this.size = currentHashedStringLength + newStringSegment.length;

    for(let j = 0; j < hashMods.length; j++){
      const currentMod = hashMods[j];
      const currentBase = hashBases[j];

      powerValues[j].length = hashPrefixSums[j].length = currentHashedStringLength + 1;

      for(let i = oldLength; i < currentHashedStringLength; i++){
        powerValues[j][i+1] = modularMultiply(powerValues[j][i], currentBase, currentMod);
        hashPrefixSums[j][i+1] = modularMultiply(hashPrefixSums[j][i], currentBase, currentMod) + newStringSegment.charCodeAt(i - oldLength);
        if(hashPrefixSums[j][i+1] >= currentMod) {
          hashPrefixSums[j][i+1] -= currentMod;
        }
      }
    }
    return currentHashedStringLength;
  };

  return createStringHasher;
})();

console.log(main());

function main(){
  const sourceStringS = inputReader.readNextToken(true);
  const targetStringT = inputReader.readNextToken(true);

  let currentSRepeated = sourceStringS;
  const minTargetLength = targetStringT.length;

  while(currentSRepeated.length < minTargetLength) {
    currentSRepeated += sourceStringS;
  }

  const initialSearchSpace = currentSRepeated + currentSRepeated;
  const stringHasher = StringHasher(initialSearchSpace);

  let firstOccurrenceIndex = stringHasher.findSubstring(targetStringT);
  if(firstOccurrenceIndex === -1) {
    return 0;
  }

  let growingTargetString = targetStringT;
  let lastSuccessfulMatchIndex = firstOccurrenceIndex;
  let successfulRepetitionCount = 0;

  while(firstOccurrenceIndex >= 0){
    growingTargetString += targetStringT;
    lastSuccessfulMatchIndex = firstOccurrenceIndex;
    successfulRepetitionCount++;
    firstOccurrenceIndex = stringHasher.findSubstring(growingTargetString, firstOccurrenceIndex);
  }

  stringHasher.appendString(currentSRepeated);

  if(stringHasher.findSubstring(growingTargetString, lastSuccessfulMatchIndex) >= 0) {
    return -1;
  }

  return successfulRepetitionCount;
}
