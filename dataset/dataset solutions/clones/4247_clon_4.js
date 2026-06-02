var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var obj;
var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  myerr("-----start-----");
  var start = new Date();
  Main();
  var end = new Date() - start;
  myerr("----- end -----");
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function nextInt(){return myconv(next(),1);} function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
function next(){return obj.next();} function hasNext(){return obj.hasNext();}
function init(input){  
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

function Main(){
  const elementCount = nextInt();
  let numericalData = nextIntArray();

  Array.from({ length: elementCount }, (_, k) => elementCount - 1 - k)
       .forEach(currentIdx => {
    const stepIncrement = currentIdx + 1;

    const affectedItems = [];
    for (let position = currentIdx; position < elementCount; position += stepIncrement) {
      affectedItems.push({ index: position, value: numericalData[position] });
    }

    const currentBlockSum = affectedItems.reduce((accumulator, item) => accumulator + item.value, 0);

    if (currentBlockSum < 0) {
      affectedItems.forEach(item => {
        numericalData[item.index] = 0;
      });
    }
  });

  const finalAggregate = numericalData.reduce((total, val) => total + val, 0);
  myout(finalAggregate);
}
