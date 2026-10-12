var InputReaderFactory=(function(){
  function createInputReader(sourceString){
    return new InputReader(sourceString);
  }

  class InputReader {
    constructor(sourceString){
      this._sourceLines = sourceString.trim().split("\n");
      this._currentLineIndex = 0;
    }

    readSingleValue(asStringFlag){
      const linesArray = this._sourceLines;
      const lineIdx = this._currentLineIndex;
      let extractedValue;

      if(typeof linesArray[lineIdx]==="string"){
        linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
      }
      extractedValue = linesArray[lineIdx].pop();

      if(!linesArray[lineIdx].length){
        this._currentLineIndex++;
      }
      return asStringFlag ? extractedValue : Number(extractedValue);
    }

    readLineValues(asStringFlag){
      const lineContent = this._sourceLines[this._currentLineIndex++];
      const values = lineContent.split(" ");
      return asStringFlag ? values : values.map(val => Number(val));
    }

    readMatrixValues(numRows, asStringFlag){
      const startIdx = this._currentLineIndex;
      const endIdx = this._currentLineIndex += numRows;
      const rawRows = this._sourceLines.slice(startIdx, endIdx);
      const processedRows = rawRows.map(line => line.split(" "));
      return asStringFlag ? processedRows : processedRows.map(row => row.map(val => Number(val)));
    }

    readRawLines(numLines, asStringFlag){
      const startIdx = this._currentLineIndex;
      const endIdx = this._currentLineIndex += numLines;
      const rawLines = this._sourceLines.slice(startIdx, endIdx);
      return asStringFlag ? rawLines : rawLines.map(val => Number(val));
    }
  }
  return createInputReader;
})();

var inputProcessor=InputReaderFactory(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue){
  var args=arguments,len=args.length,result="Array(args["+--len+"]).fill(0).map(x=>{return "+initialValue+";})";
  while(--len)result="Array(args["+len+"]).fill(0).map(x=>"+result+")";
  return eval(result);
}

var MODULUS_VAL = 1000003;

function modularMultiply(){
  for(var factors=arguments,currentResult=factors[0],factorIndex=1;factorIndex<factors.length;){
    const currentFactor = factors[factorIndex++];
    currentResult = ((currentResult >> 16) * currentFactor % MODULUS_VAL * 65536 + (currentResult & 65535) * currentFactor) % MODULUS_VAL;
  }
  return currentResult;
}

var factorialsCache=[1,1];

function precomputeFactorials(limit){
  for(let k=2; k<=limit; k++){
    factorialsCache[k] = modularMultiply(factorialsCache[k-1], k);
  }
}

function modularInverse(numA){
  let currentA = numA;
  let currentB = MODULUS_VAL;
  let x_coeff = 1;
  let y_coeff = 0;
  let temp_val;

  while (currentB !== 0) {
    const quotient = Math.floor(currentA / currentB);

    temp_val = x_coeff - quotient * y_coeff;
    x_coeff = y_coeff;
    y_coeff = temp_val;

    temp_val = currentA % currentB;
    currentA = currentB;
    currentB = temp_val;
  }
  x_coeff %= MODULUS_VAL;
  return x_coeff < 0 ? x_coeff + MODULUS_VAL : x_coeff;
}

function nPermutationsMod(nVal, rVal){
  const numerator = factorialsCache[nVal];
  const denominatorInverse = modularInverse(factorialsCache[(nVal - rVal + MODULUS_VAL) % MODULUS_VAL]);
  return modularMultiply(numerator, denominatorInverse);
}

function modularExponentiation(baseVal, expVal){
  let result = 1;
  let currentBase = baseVal;
  let exponent = expVal;

  while (exponent > 0) {
    if (exponent & 1) {
      result = modularMultiply(result, currentBase);
    }
    currentBase = modularMultiply(currentBase, currentBase);
    exponent >>= 1;
  }
  return result;
}

function handleZeroDiffCase(base, count) {
    return modularExponentiation(base, count);
}

function handleNonZeroDiffCase(base, diff, count) {
    const diffInverse = modularInverse(diff);
    const termXDivD = modularMultiply(base, diffInverse);
    const adjustedBase = ((MODULUS_VAL - termXDivD) % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;
    const permutationsPart = nPermutationsMod(adjustedBase, count);
    const modDiff = (MODULUS_VAL - diff + MODULUS_VAL) % MODULUS_VAL;
    const modDiffPower = modularExponentiation(modDiff, count);
    return modularMultiply(permutationsPart, modDiffPower);
}


console.log(main());

function main(){
  var numQueries = inputProcessor.readSingleValue();
  var resultsArray = Array(numQueries).fill(0);
  precomputeFactorials(MODULUS_VAL);

  for(var queryIndex = 0; queryIndex < numQueries; queryIndex++){
    var queryData = inputProcessor.readLineValues();
    const [baseX, diffD, countN] = queryData;

    if(countN >= MODULUS_VAL){
      continue;
    }

    if(diffD === 0){
      resultsArray[queryIndex] = handleZeroDiffCase(baseX, countN);
    }else{
      resultsArray[queryIndex] = handleNonZeroDiffCase(baseX, diffD, countN);
    }
  }
  return resultsArray.join("\n");
}
