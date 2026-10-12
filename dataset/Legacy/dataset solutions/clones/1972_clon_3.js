var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error('\n');
  var start = Date.now();
  Main();
  var end = Date.now() - start;
  myerr('time : ' + end + 'ms');
  myerr('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});
function makeClone(obj){return (obj instanceof Set) ? new Set(Array.from(obj)) : JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw 'ArrayIndexOutOfBoundsException ‚There is no more input';}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error('debug:' + require('util').inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(' ');case 4:return i.split(' ').map(Number);case 6:return i.split('');case 7:return i.split('').map(Number);case 8:return i.join(' ');case 9:return i.join('\n');case 0:return i.join('');default:return i;}}catch(e){return i;}}

function calculateMinMaxSums(currentIterationValue, upperLimitValue) {
  const TRIANGULAR_DIVISOR = 2;
  const minimumPossibleSum = (currentIterationValue * (currentIterationValue - 1)) / TRIANGULAR_DIVISOR;
  const maximumPossibleSum = (upperLimitValue * currentIterationValue) - minimumPossibleSum;
  return { min: minimumPossibleSum, max: maximumPossibleSum };
}

function Main(){
  var inputValues = nextIntArray();
  var upperLimit = inputValues[0];
  var lowerLimit = inputValues[1];
  
  const modulusValue = 1000000007;
  var cumulativeSum = 0;
  
  for(let currentIteration = lowerLimit; currentIteration <= upperLimit + 1; currentIteration++){
    const sumBounds = calculateMinMaxSums(currentIteration, upperLimit);
    const minimumSumForIteration = sumBounds.min;
    const maximumSumForIteration = sumBounds.max;
    
    let rangeSize = maximumSumForIteration - minimumSumForIteration + 1;
    cumulativeSum = (cumulativeSum + rangeSize) % modulusValue;
  }
  myout(cumulativeSum);
}
