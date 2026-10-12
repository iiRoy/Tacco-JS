var read = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var obj;
var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = init(inLine);
  console.error("\n");
  var start = Date.now();
  processSequence();
  var end = Date.now() - start;
  myerr("time : " + (end) + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}
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

function processSequence(){
    const sourceString = next();
    const targetString = next();
    const sourceLength = sourceString.length;

    const characterOccurrences = new Map();
    for (let i = 0; i < sourceLength; i++) {
        const char = sourceString[i];
        if (!characterOccurrences.has(char)) {
            characterOccurrences.set(char, []);
        }
        characterOccurrences.get(char).push(i);
    }

    for (const char of targetString) {
        if (!characterOccurrences.has(char)) {
            myout(-1);
            return;
        }
    }

    const finalAbsolutePosition = [...targetString].reduce((currentAbsolutePosition, targetChar) => {
        const charIndices = characterOccurrences.get(targetChar);

        const searchStartRelative = (currentAbsolutePosition === -1) ? 0 : (currentAbsolutePosition + 1) % sourceLength;

        let foundIndexInList = charIndices.findIndex(pos => pos >= searchStartRelative);

        let nextAbsolutePosition;

        if (foundIndexInList !== -1) {
            const currentCycleCount = (currentAbsolutePosition === -1) ? 0 : Math.floor((currentAbsolutePosition + 1) / sourceLength);
            nextAbsolutePosition = currentCycleCount * sourceLength + charIndices[foundIndexInList];
        } else {
            const nextCycleCount = (currentAbsolutePosition === -1) ? 0 : Math.floor((currentAbsolutePosition + 1) / sourceLength) + 1;
            nextAbsolutePosition = nextCycleCount * sourceLength + charIndices[0];
        }

        return nextAbsolutePosition;
    }, -1);

    myout(finalAbsolutePosition + 1);
}
