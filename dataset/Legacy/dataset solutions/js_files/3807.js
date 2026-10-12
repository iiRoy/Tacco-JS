//Don't have to see. start------------------------------------------
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
  var returnObj = {
    list : input, index : 0, max : input.length,
    hasNext : function(){return (this.index < this.max);},
    next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException ‚There is no more input";}else{var returnInput = this.list[this.index++];return returnInput;}}
  };
  return returnObj;
}
function myout(s){console.log(s);}
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}
//param "no" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join nextline. 0: join no character.
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

//Don't have to see. end------------------------------------------
function Main(){
  var N = nextInt();
  var list = nextIntArray();
  var output = 0;
  var L = 0;
  var R = 0;
  var xor = list[0];
  while(L < N || R < N){
    //Rを「xor == +」が成り立つ間、進めてみる。
    //outputはLRの距離だけ増える
    //もし成り立たないところが出てきたら
    //LRの距離の累積和をoutputに足す
    //Lを進める。以下、繰り返し
    //myerr("now : " + xor);
    //myerr({L,R});
    if(xor + list[R + 1] == (xor ^ list[R + 1])){
      //myerr("ok");
      //myerr(R - L + 1);
      output += R - L + 1;
      R++;
      xor += list[R];
    }else{
      //myerr("ng");
      //output += 1//(R - L - 1) * (R - L - 2) / 2;
      xor -= list[L];
      L++;
      if(R < L){
        R = L;
        xor = list[R];
      }
    }
    //myerr("next : " + xor);
    //myerr({L,R});
  }
  myout(output + N);
}
