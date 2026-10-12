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

function Main() {
  const cellCount = nextInt();
  const totalElements = cellCount * cellCount;

  const contentRegistry = new Map();

  const signalFailure = () => {
    myout("No");
    return;
  };

  const initialIndices = nextIntArray();
  for (let k = 0; k < cellCount; k++) {
    const elementValue = k + 1;
    const targetPosition = initialIndices[k] - 1;

    if (contentRegistry.has(targetPosition)) {
      signalFailure();
      return;
    }
    contentRegistry.set(targetPosition, elementValue);
  }

  const vacantPositions = new Set();
  for (let i = 0; i < totalElements; i++) {
    if (!contentRegistry.has(i)) {
      vacantPositions.add(i);
    }
  }

  for (let currentVal = 2; currentVal <= cellCount; currentVal++) {
    let requiredFillings = currentVal - 1;
    for (let i = 0; i < totalElements && requiredFillings > 0; i++) {
      if (vacantPositions.has(i)) {
        contentRegistry.set(i, currentVal);
        vacantPositions.delete(i);
        requiredFillings--;
      } else if (contentRegistry.get(i) === currentVal) {
        signalFailure();
        return;
      }
    }
  }

  for (let currentVal = 1; currentVal < cellCount; currentVal++) {
    let requiredFillings = cellCount - currentVal;
    for (let i = totalElements - 1; i >= 0 && requiredFillings > 0; i--) {
      if (vacantPositions.has(i)) {
        contentRegistry.set(i, currentVal);
        vacantPositions.delete(i);
        requiredFillings--;
      } else if (contentRegistry.get(i) === currentVal) {
        signalFailure();
        return;
      }
    }
  }

  if (vacantPositions.size > 0) {
    signalFailure();
    return;
  }

  const finalArrangement = new Array(totalElements);
  for (let i = 0; i < totalElements; i++) {
    finalArrangement[i] = contentRegistry.get(i);
  }

  myout("Yes");
  myout(myconv(finalArrangement, 8));
}
