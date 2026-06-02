//↓見なくていいよ！ここから--------------------------------------------------
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
  var start = new Date();
  Main();
  var end = new Date() - start;
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
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

//↑見なくていいよ！ここまで--------------------------------------------------
function Main(){
    const queryCount = nextInt(); // Renamed N to queryCount
    const maxDimension = 200;
    const maxPossibleSum = 3 * maxDimension * maxDimension + 3 * maxDimension * maxDimension;
    const sumFrequency = new Uint32Array(maxPossibleSum + 1); // Using Uint32Array for counts, initialized to zeros

    // Generate all possible sums and record their frequencies
    // Using nested Array.from().forEach() for iteration instead of traditional for loops
    Array.from({ length: maxDimension }, (_, idxA) => idxA + 1)
        .forEach(valA => {
            Array.from({ length: maxDimension }, (_, idxB) => idxB + 1)
                .forEach(valB => {
                    Array.from({ length: maxDimension }, (_, idxC) => idxC + 1)
                        .forEach(valC => {
                            const calculatedValue = valA * valA + valB * valB + valC * valC + valA * valB + valB * valC + valC * valA;
                            sumFrequency[calculatedValue]++;
                        });
                });
        });

    // Construct the final result array based on the input queryCount
    // Using Array.from().map() for output generation instead of a for loop with conditional checks
    const finalResultSequence = Array.from({ length: queryCount }, (_, index) => {
        const targetIndex = index + 1;
        return sumFrequency[targetIndex] || 0; // If sumFrequency[targetIndex] is undefined or 0, return 0
    });

    myout(myconv(finalResultSequence, 9));
}
