var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputSource;
var rawInputLines = [];
inputReader.on('line', function(lineContent){rawInputLines.push(lineContent);});
inputReader.on('close', function(){
  inputSource = createInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  computeMinAbsoluteSum();
});

const createDeepCopy = (item) => (item instanceof Set) ? new Set(Array.from(item)) : JSON.parse(JSON.stringify(item));

const parseInputToken = (token, conversionType) => {
  const conversionMap = {
    1: (val) => parseInt(val),
    2: (val) => val.split(' '),
    4: (val) => val.split(' ').map(Number),
    6: (val) => val.split(''),
    7: (val) => val.split('').map(Number),
    8: (val) => val.join(' '),
    9: (val) => val.join('\n'),
    0: (val) => val.join('')
  };
  try {
    return conversionMap[conversionType] ? conversionMap[conversionType](token) : token;
  } catch (e) {
    return token;
  }
};

const getInteger = () => parseInputToken(retrieveNext(), 1);
const getStringArray = () => parseInputToken(retrieveNext(), 2);
const getIntegerArray = () => parseInputToken(retrieveNext(), 4);
const getCharacterArray = () => parseInputToken(retrieveNext(), 6);

const retrieveNext = () => inputSource.pullNext();
const checkAvailability = () => inputSource.hasMore();

const createInputProcessor = (lines) => {  
  let currentLineIndex = 0;
  const totalLines = lines.length;
  return {
    linesList : lines,
    currentPosition : 0,
    totalCount : lines.length,
    hasMore : function(){return (this.currentPosition < this.totalCount);},
    pullNext : function(){
      if(this.hasMore()){
        return this.linesList[this.currentPosition++];
      }else{
        throw 'EndOfInputException: No more input available';
      }
    }
  };
};

const displayResult = (outputValue) => {console.log(outputValue);};
const logDebug = (debugInfo) => {console.error('debug:' + require('util').inspect(debugInfo,false,null));};

function computeMinAbsoluteSum(){
  const dimensions = getIntegerArray();
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  const firstMatrix = Array.from({ length: gridHeight }, () => getIntegerArray());
  const secondMatrix = Array.from({ length: gridHeight }, () => getIntegerArray());

  const differenceMatrix = Array.from({ length: gridHeight }, (_, r) =>
    Array.from({ length: gridWidth }, (_, c) =>
      Math.abs(firstMatrix[r][c] - secondMatrix[r][c])
    )
  );

  const maximumPossibleSum = 13000;
  
  const dpState = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => new Set())
  );
  
  dpState[0][0].add(differenceMatrix[0][0]);

  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (r === 0 && c === 0) {
        continue;
      }

      const currentCellValue = differenceMatrix[r][c];
      const reachableSumsForCurrentCell = new Set();

      if (r > 0) { // Can come from the cell above
        for (const previousSum of dpState[r - 1][c]) {
          reachableSumsForCurrentCell.add(Math.abs(previousSum + currentCellValue));
          reachableSumsForCurrentCell.add(Math.abs(previousSum - currentCellValue));
        }
      }

      if (c > 0) { // Can come from the cell to the left
        for (const previousSum of dpState[r][c - 1]) {
          reachableSumsForCurrentCell.add(Math.abs(previousSum + currentCellValue));
          reachableSumsForCurrentCell.add(Math.abs(previousSum - currentCellValue));
        }
      }
      dpState[r][c] = reachableSumsForCurrentCell;
    }
  }

  const finalCellSums = dpState[gridHeight - 1][gridWidth - 1];
  for (let s = 0; s < maximumPossibleSum; s++) {
    if (finalCellSums.has(s)) {
      displayResult(s);
      return;
    }
  }
}
