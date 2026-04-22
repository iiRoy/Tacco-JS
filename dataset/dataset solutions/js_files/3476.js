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
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
  var N = nextInt();
  var list = new Array(N);
  var output = 0;
  var queue = [];
  for(var i = 0; i < N; i++){
    list[i] = nextInt();
  }
  list.sort(function(a,b){
  	return a - b;
  });
  
  queue.push(list.shift());
  while(list.length > 0){
    var useMae = queue[0];
    var useAto = queue[queue.length - 1];
    var inMae = list[0];
    var inAto = list[list.length - 1];
    if(useMae == useAto && inMae == inAto){
      queue.push(list.pop());
    }else if(useMae == useAto){
      if(Math.abs(useMae - inMae) >= Math.abs(useMae - inAto)){
        queue.push(list.shift());
      }else{
        queue.push(list.pop());
      }
    }else if(inMae == inAto){
      if(Math.abs(useMae - inMae) >= Math.abs(useAto - inMae)){
        queue.unshift(list.shift());
      }else{
        queue.push(list.shift());
      }
    }else{
      var res1 = Math.abs(inMae - useMae);
      var res2 = Math.abs(inMae - useAto);
      var res3 = Math.abs(inAto - useMae);
      var res4 = Math.abs(inAto - useAto);
      if(res1 >= res2 && res1 >= res3 && res1 >= res4){
        queue.unshift(list.pop());
        continue;
      }
      if(res2 >= res1 && res2 >= res3 && res2 >= res4){
        queue.push(list.shift());
        continue;
      }
      if(res3 >= res1 && res3 >= res2 && res3 >= res4){
        queue.unshift(list.pop());
        continue;
      }
      if(res4 >= res1 && res4 >= res2 && res4 >= res3){
        queue.push(list.pop());
      }
    }
  }
  
  for(var i = 1; i < N; i++){
    output += Math.abs(queue[i - 1] - queue[i]);
  }
  myout(output);
}