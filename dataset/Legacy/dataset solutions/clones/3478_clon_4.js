var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  Main();
  var end = Date.now() - start;
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  return {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(this.hasNext()){return this.list[this.index++];}else{throw "ArrayIndexOutOfBoundsException ‚There is no more input";}}
  };
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function Main(){
  const inputN = nextInt();
  let kValue = -1;

  const discriminant = 1 + 8 * inputN;
  const rootDiscriminant = Math.sqrt(discriminant);

  if (Number.isInteger(rootDiscriminant)) {
    const potentialK = (-1 + rootDiscriminant) / 2;
    if (Number.isInteger(potentialK) && potentialK >= 0) {
      kValue = potentialK;
    }
  }

  if (kValue === -1) {
    myout("No");
    return;
  }

  myout("Yes");

  const collectionOfSets = Array.from({ length: kValue + 1 }, () => []);
  let elementCounter = 1;

  for (let setIndexA = 0; setIndexA < kValue; setIndexA++) {
    for (let setIndexB = setIndexA + 1; setIndexB <= kValue; setIndexB++) {
      collectionOfSets[setIndexA].push(elementCounter);
      collectionOfSets[setIndexB].push(elementCounter);
      elementCounter++;
    }
  }
  
  myout(collectionOfSets.length);

  const formattedOutputLines = collectionOfSets.map(currentSet => {
    return `${kValue} ${currentSet.join(' ')}`;
  });

  myout(formattedOutputLines.join('\n'));
}
