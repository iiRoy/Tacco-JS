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
//不明値、異常時:引数そのまま返す　1:数値へ変換
//2:半角SPで分割 4:半角SPで分割し、数値配列へ
//6:1文字で分割  7:1文字で分割し、数値配列へ
//8:半角SPで結合 9:改行で結合 0:文字なしで結合
function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
function Main(){
  var s = next();
  //26文字未満：未使用の文字のなかで辞書順最小のをくっつける
  //26文字ちょうど：下記文字列かどうか
  //zyxwvutsrqponmlkjihgfedcba
  //そうでないなら、どこか辞書順最小でない箇所があるので、そこの一つ前の文字を辞書順で次の文字に入れ替え、
  //それよりあとの文字列は全消し
  var list = myconv("abcdefghijklmnopqrstuvwxyz",6);
  if(s.length < 26){
     for(var i = 0; i < s.length; i++){
       list[list.indexOf(s[i])] = "";
     }
    myerr(list);
     for(var i = 0; i < 26; i++){
       if(list[i] != ""){
          s += list[i];
         break;
       }
     }
    myout(s);
  }else{
    if(s == "zyxwvutsrqponmlkjihgfedcba"){
       myout(-1);
    }else{
       
    }
  }
}