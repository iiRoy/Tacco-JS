var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(line){
  inputLines.push(line);
});

inputReader.on('close', function(){
  inputProcessor = initializeInput(inputLines);
  console.error('\n↑入力 ↓出力');
  solveProblem();
});

function deepCopy(item){
  return (item instanceof Set) ? new Set(Array.from(item)) : JSON.parse(JSON.stringify(item));
}

function readInt(){
  return convertInput(getNextToken(), 1);
}

function readStrArray(){
  return convertInput(getNextToken(), 2);
}

function readIntArray(){
  return convertInput(getNextToken(), 4);
}

function readCharArray(){
  return convertInput(getNextToken(), 6);
}

function getNextToken(){
  return inputProcessor.getNextToken();
}

function hasMoreTokens(){
  return inputProcessor.hasMoreTokens();
}

function initializeInput(lines){
  return {
    data : lines,
    pointer : 0,
    total : lines.length,
    hasMoreTokens : function(){
      return (this.pointer < this.total);
    },
    getNextToken : function(){
      if(this.hasMoreTokens()){
        return this.data[this.pointer++];
      } else {
        throw 'InputExhaustedException: No more input available';
      }
    }
  };
}

function outputResult(val){
  console.log(val);
}

function logDebug(val){
  console.error('debug:' + require('util').inspect(val, false, null));
}

function convertInput(data, type){
  try {
    switch(type){
      case 1: return parseInt(data);
      case 2: return data.split(' ');
      case 4: return data.split(' ').map(Number);
      case 6: return data.split('');
      case 7: return data.split('').map(Number);
      case 8: return data.join(' ');
      case 9: return data.join('\n');
      case 0: return data.join('');
      default: return data;
    }
  } catch(e) {
    return data;
  }
}

function solveProblem(){
  const dimensions = readIntArray();
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  const gridA = Array.from({ length: gridHeight }, () => readIntArray());

  const diffGrid = Array.from({ length: gridHeight }, (r) => {
    const rowB = readIntArray();
    return Array.from({ length: gridWidth }, (c) => Math.abs(gridA[r][c] - rowB[c]));
  });

  const sumLimit = 90;

  const dpState = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () => new Set())
  );

  dpState[0][0].add(diffGrid[0][0]);

  const updateReachableSums = (sourceSet, currentCellValue, targetSet, limit) => {
    sourceSet.forEach(prevSum => {
      const sumPlus = Math.abs(prevSum + currentCellValue);
      const sumMinus = Math.abs(prevSum - currentCellValue);
      if (sumPlus < limit) targetSet.add(sumPlus);
      if (sumMinus < limit) targetSet.add(sumMinus);
    });
  };

  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (r === 0 && c === 0) continue;

      if (r > 0) {
        updateReachableSums(dpState[r - 1][c], diffGrid[r][c], dpState[r][c], sumLimit);
      }

      if (c > 0) {
        updateReachableSums(dpState[r][c - 1], diffGrid[r][c], dpState[r][c], sumLimit);
      }
    }
  }

  let minimumFinalSum = Infinity;
  dpState[gridHeight - 1][gridWidth - 1].forEach(s => {
    if (s < minimumFinalSum) {
      minimumFinalSum = s;
    }
  });

  outputResult(minimumFinalSum);
}
