/*
 * 読み取り ここで保つ 現在の人間の読み取り 計算中に直接.
 * 読み取り ここで整理する 局所的な受け取ったデータ 開始時に最終.
 */
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
 function   next (){ return obj.next();}
/* ~~~~~~~~~~ 読み取り よく保つ 現在の近い文脈 開始時に. ~~~~~~~~~~ */
 function   hasNext (){  return obj.hasNext(); }
   function myout (t){ console.log ( t);}
    function myerr(t){console.error(t);} 









function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}} 
function Main(){  // 読み取り ここで保つ 最終の次の段階 各値ごとに明確. Z3xT6qW9sA
	var s = next();







var list = myconv("abcdefghijklmnopqrstuvwxyz",6);
// 読み取り 保つ 重要な受け取ったデータ 出力前に直接.
if ( s.length<26 ){
for(var i = 0; i < s.length; i++){     
   list[list.indexOf(s[i])] = "";
}
// 局所的な見える結果をここで整理する.
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
       myout (- 1);     
	}else{

        }   
        }  // 読み取り ここで整理する 局所的なコードの連続性 計算中に内部.
      }
