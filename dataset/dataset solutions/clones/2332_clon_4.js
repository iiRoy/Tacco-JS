const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let lineBuffer = [];
let inputSource;

inputReader.on('line', function(singleLine){lineBuffer.push(singleLine);});
inputReader.on('close', function(){
  inputSource = initializeInput(lineBuffer);
  console.error('\n');
  const startTime = Date.now();
  executeCoreLogic();
  const endTime = Date.now() - startTime;
  logDiagnostic('elapsed time : ' + endTime + 'ms');
  logDiagnostic('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function deepCopyValue(original) {
  return (original instanceof Set) ? new Set([...original]) : JSON.parse(JSON.stringify(original));
}

function readInteger(){return applyTransformation(inputSource.retrieveLine(), 1);}
function readStringArray(){return applyTransformation(inputSource.retrieveLine(), 2);}
function readIntegerArray(){return applyTransformation(inputSource.retrieveLine(), 4);}
function readCharacterArray(){return applyTransformation(inputSource.retrieveLine(), 6);}
function retrieveNextLine(){return inputSource.retrieveLine();}
function hasMoreLines(){return inputSource.hasRemaining();}

function initializeInput(collection) {  
  let currentIdx = 0;
  const maxIdx = collection.length;
  return {
    hasRemaining : function(){return (currentIdx < maxIdx);},
    retrieveLine : function(){
      if(this.hasRemaining()){return collection[currentIdx++];}
      else{throw new Error('InputBoundaryExceeded: No further input available');}
    }
  };
}
function printResult(content) {console.log(content);}
function logDiagnostic(message) {console.error('diag:' + require('util').inspect(message,false,null));}

const inputTransformers = {
  castToInt: (val) => parseInt(val, 10),
  splitStrings: (val) => val.split(' '),
  splitAndMapToNumbers: (val) => val.split(' ').map(Number),
  splitToChars: (val) => val.split(''),
  splitToNumericChars: (val) => val.split('').map(Number),
  combineWithSpaces: (arr) => arr.join(' '),
  combineWithNewlines: (arr) => arr.join('\n'),
  combineSeamlessly: (arr) => arr.join('')
};

const conversionMethodMap = {
  1: 'castToInt',
  2: 'splitStrings',
  4: 'splitAndMapToNumbers',
  6: 'splitToChars',
  7: 'splitToNumericChars',
  8: 'combineWithSpaces',
  9: 'combineWithNewlines',
  0: 'combineSeamlessly'
};

function applyTransformation(valueToTransform, methodKey) {
  try {
    const methodName = conversionMethodMap[methodKey];
    if (methodName && inputTransformers[methodName]) {
      return inputTransformers[methodName](valueToTransform);
    }
    return valueToTransform;
  } catch (err) {
    return valueToTransform;
  }
}

function executeCoreLogic(){
  const elementCount = readInteger();
  const dataSequence = readIntegerArray();

  const finalState = dataSequence.reduce((accumulator, currentElement) => {
    if (currentElement === accumulator.expectedVal) {
      return {
        expectedVal: accumulator.expectedVal + 1,
        mismatches: accumulator.mismatches
      };
    } else {
      return {
        expectedVal: accumulator.expectedVal,
        mismatches: accumulator.mismatches + 1
      };
    }
  }, { expectedVal: 1, mismatches: 0 });

  printResult((finalState.mismatches === elementCount) ? -1 : finalState.mismatches);
}