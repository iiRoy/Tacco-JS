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
    var gridDimensions = nextIntArray();
    var gridHeight = gridDimensions[0];
    var gridWidth = gridDimensions[1];

    var characterGrid = new Array(gridHeight);
    for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
        characterGrid[rowIdx] = nextCharArray();
    }

    var horizontalLeftLengths = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));
    var horizontalRightLengths = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));
    var verticalUpLengths = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));
    var verticalDownLengths = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0));

    for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
        for(var colIdx = 0; colIdx < gridWidth; colIdx++){
            if(characterGrid[rowIdx][colIdx] === "."){
                horizontalLeftLengths[rowIdx][colIdx] = (colIdx > 0 ? horizontalLeftLengths[rowIdx][colIdx-1] : 0) + 1;
                verticalUpLengths[rowIdx][colIdx] = (rowIdx > 0 ? verticalUpLengths[rowIdx-1][colIdx] : 0) + 1;
            }
        }
    }

    for(var rowIdx = gridHeight - 1; rowIdx >= 0; rowIdx--){
        for(var colIdx = gridWidth - 1; colIdx >= 0; colIdx--){
            if(characterGrid[rowIdx][colIdx] === "."){
                horizontalRightLengths[rowIdx][colIdx] = (colIdx < gridWidth - 1 ? horizontalRightLengths[rowIdx][colIdx+1] : 0) + 1;
                verticalDownLengths[rowIdx][colIdx] = (rowIdx < gridHeight - 1 ? verticalDownLengths[rowIdx+1][colIdx] : 0) + 1;
            }
        }
    }

    var largestCrossSize = 0;
    for(var rowIdx = 0; rowIdx < gridHeight; rowIdx++){
        for(var colIdx = 0; colIdx < gridWidth; colIdx++){
            if(characterGrid[rowIdx][colIdx] === "."){
                var currentFullHorizontal = horizontalLeftLengths[rowIdx][colIdx] + horizontalRightLengths[rowIdx][colIdx] - 1;
                var currentFullVertical = verticalUpLengths[rowIdx][colIdx] + verticalDownLengths[rowIdx][colIdx] - 1;
                largestCrossSize = Math.max(largestCrossSize, currentFullHorizontal + currentFullVertical - 1);
            }
        }
    }
    myout(largestCrossSize);
}
