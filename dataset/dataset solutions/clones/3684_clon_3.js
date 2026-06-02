var source = init();
Main();
function nextInt(){
  var value = next();
  return myconv(value,1);
}
function nextStrArray(){return myconv(next(),2);}//半角スペース分割
function nextIntArray(){return myconv(next(),4);}//半角スペース + 数値化
function nextCharArray(){return myconv(next(),6);}//1文字分割
function next(){return source.next();}
function hasNext(){return source.hasNext();}
function myin(){
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}
function init(){
  var lines = myin();
  var dataObj = {
    "list" : lines,
    "index" : 0,
    "max" : lines.length,
    "hasNext" : function(){
      return (this.index < this.max);
    },
    "next" : function(){
      if(!this.hasNext()){
        return "";
      }else{
        var currentInput = this.list[this.index];
        this.index++;
        return currentInput;
      }
    }
  };
  return dataObj;
}
function myout(t){console.log(t);}//標準出力
function myerr(t){console.error(t);}//標準エラー出力
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){
  try{
    switch(no){
      case 1:return parseInt(i);
      case 2:return i.split(" ");
      case 4:return i.split(" ").map((a)=>Number(a));
      case 6:return i.split("");
      case 7:return i.split("").map((a)=>Number(a));
      case 8:return i.join(" ");
      case 9:return i.join("\n");
      case 0:return i.join("");
      default:return i;
    }
  }catch(e){
    return i;
  }
}
function rememberValue(pos, value, firstSet, secondSet){
  if(pos % 2 == 0){
    firstSet.add(value);
  }else{
    secondSet.add(value);
  }
}
function isMissingAtPosition(pos, value, firstSet, secondSet){
  if(pos % 2 == 0){
    return !firstSet.has(value);
  }else{
    return !secondSet.has(value);
  }
}
function Main(){
  var N = nextInt();
  var list = new Array();
  var oddSet = new Set();
  var evenSet = new Set();
  for(var i = 0; i < N; i++){
    var tmp = nextInt();
    list[i] = tmp;
    rememberValue(i, tmp, oddSet, evenSet);
  }
  list.sort(function(a,b){
    var diff = a - b;
    return diff;
  });
  var output = 0;
  for(var i = 0; i < N; i++){
    var sortedValue = list[i];
    if(isMissingAtPosition(i, sortedValue, oddSet, evenSet)){
      output++;
    }
  }
  var answer = output / 2;
  myout(answer);
}
