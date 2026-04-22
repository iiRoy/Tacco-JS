var output;
var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var obj = {
  "list" : input,
  "index" : 0,
  "max" : input.length,
  "next" : function(){
    if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
    var returnObj = this.list[this.index];
    this.index++;
    return returnObj;
  },
  "hasNext" : function(){return (this.index < this.max);}
}
Main();
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);}//standard output
function myerr(t){console.error(t);}//standard error
//[no]要素の扱い。数値型
//不明値、異常時:引数そのまま返す
//1:数値へ変換 2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字に分割 7:1文字に分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main() {
  var s = myconv(next(),6);
  var list = {};
  for(var i = 0; i < s.length; i++){
    if(list[s[i]] == null){
       list[s[i]] = 1;
    }else{
       list[s[i]]++;
    }
  }
  var maxKeys = [];
  var max = 0;
  var keys = Array.from(Object.keys(list));
  if(keys.length == 1){
     myout(0);
    return;
  }
  
  var output = 107;
  for(var j = 0; j < keys.length; j++){
    var tmpKey = keys[j];
    var tmpS = Object.assign([],s);
    var count = 0;
  while(!check(tmpS,tmpKey)){
    for(var i = 0; i < tmpS.length; i++){
      if(tmpS[i+1] == tmpKey){
         tmpS[i] = tmpKey;
      }
    }
    tmpS.pop();
    count++;
  }
    output = Math.min(output,count);
  }
  myout(output);
}
function check(str,chr){
    var ret = true;
    for(var i = 0; i < str.length; i++){
      if(str[i] != chr){
         ret = false;
      }
    }
    return ret;
}
