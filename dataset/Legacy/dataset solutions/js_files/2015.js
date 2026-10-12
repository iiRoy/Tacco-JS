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
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す 1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}

//↑見なくていいよ！ここまで--------------------------------------------------
function Main(){
  var N = nextInt();
  var list = getDivisorList(N);
  var minusList = getDivisorList(N - 1);
  var output = new Set();
  for(var i = 1; i < minusList.length; i++){
    output.add(minusList[i]);
  }
  for(var i = 1; i < list.length; i++){
    var tmpN = N;
    while(tmpN >= list[i]){
      if(tmpN % list[i] == 0){
        tmpN /= list[i];
      }else{
        tmpN %= list[i];
      }
    }
    if(tmpN == 1){
      output.add(list[i]);
    }
  }
  myout(output.size);
}
function getDivisorList(val){
  var list = [];
  for(var i = 1; i * i <= val; i++){
    if(val % i == 0){
      list.push(i);
      if(i * i != val){
        list.push(val / i);
      }
    }
  }
  list.sort(function(a,b){ return a - b; });
  return list;
}
function isPrime(val){
  if(val == null || val <= 1 || (val != 2 && val % 2 == 0)){
    return false;
  }else if(val == 2){
    return true;
  }
  var root = Math.floor(Math.sqrt(val));
  for(var i = 3; i <= root; i += 2){
    if(val % i == 0){
      return false;
    }
  }
  return true;
}
function getPrimeFactorization(val){
  var primeMap = {};
  var div = 2;
  while(val != 1){
    if(val % div == 0){
      (primeMap[div] == null)  ? primeMap[div] = 1 : primeMap[div]++;
      val /= div;
      if(isPrime(val)){
        (primeMap[val] == null)  ? primeMap[val] = 1 : primeMap[val]++;
        break;
      }
    }else{
      div = (div == 2) ? div + 1 : div + 2;
    }
  }
  return primeMap;
}