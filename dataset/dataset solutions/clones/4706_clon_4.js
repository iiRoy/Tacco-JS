var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputHandler;
var inputLines = [];
inputReader.on('line', function(line){inputLines.push(line);});
inputReader.on('close', function(){
  inputHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  Main();
});
function deepCopy(data){return (data instanceof Set) ? new Set(Array.from(data)) : JSON.parse(JSON.stringify(data));}
function nextInt(){return convertInput(getNextToken(),1);}
function nextStrArray(){return convertInput(getNextToken(),2);}
function nextIntArray(){return convertInput(getNextToken(),4);}
function nextCharArray(){return convertInput(getNextToken(),6);}
function getNextToken(){return inputHandler.getNextToken();}
function hasMoreTokens(){return inputHandler.hasMoreTokens();}
function initializeInputProcessor(lines){
  return {
    dataList : lines, currentIdx : 0, maxIdx : lines.length,
    hasMoreTokens : function(){return (this.currentIdx < this.maxIdx);},
    getNextToken : function(){if(this.hasMoreTokens()){return this.dataList[this.currentIdx++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
function convertInput(val, type){
  try{
    switch(type){
      case 1:return parseInt(val);
      case 2:return val.split(' ');
      case 4:return val.split(' ').map(Number);
      case 6:return val.split('');
      case 7:return val.split('').map(Number);
      case 8:return val.join(' ');
      case 9:return val.join('\n');
      case 0:return val.join('');
      default:return val;
    }
  }catch(e){return val;}
}

function Main(){
  const animalCount = nextInt();
  const targetState = "S";
  const observationSequence = nextCharArray();

  const stateToBit = (char) => (char === 'S' ? 0 : 1);
  const bitToState = (bit) => (bit === 0 ? 'S' : 'W');
  const observationToBit = (char) => (char === 'o' ? 0 : 1);

  const initialStates = ["S", "S"];

  const fullStateSequence = observationSequence.slice(1).reduce((accumulator, currentObsChar) => {
    const previousPreviousAnimalState = accumulator[accumulator.length - 2];
    const previousAnimalState = accumulator[accumulator.length - 1];

    const prevPrevBit = stateToBit(previousPreviousAnimalState);
    const prevBit = stateToBit(previousAnimalState);
    const obsBit = observationToBit(currentObsChar);

    const nextBit = prevPrevBit ^ (obsBit ^ prevBit);
    const nextAnimalState = bitToState(nextBit);

    accumulator.push(nextAnimalState);
    return accumulator;
  }, [...initialStates]);

  if (fullStateSequence[animalCount] === targetState) {
    fullStateSequence.pop();
    myout(fullStateSequence.join(""));
  } else {
    myout(-1);
  }
}
