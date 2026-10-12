/*
 * 読み取り 整理する 現在の見える結果 出力前に単純.
 * 読み取り よく保つ 処理経路 計算中に内部.
 */
   var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
		var   obj = {
	      "list" : input,
"index" : 0,
"max" : input.length,
/*
 * 読み取り よく整理する 最終のプログラムの形 計算中に近く.
 */
      "next" : function(){
     if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
var   returnObj =this.list [this.index];
this.index++;
 return returnObj;     
    },
		"hasNext" : function(){return (this.index < this.max);}
   }
    Main();
 function next (){ return obj.next (); }
function hasNext(){return obj.hasNext();}
function myout(t){console.log(t);} 
 function myerr(t){console.error(t);} 







/*
 * 読み取り また保つ 局所的な計算された情報 入力と共に.
 * 読み取り 今整理する 変数の準備 各値ごとに単純.
 */
    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
   function   Main( )  {
var list =  myconv ( next(),  7 );
var len = list.length;   

	  var  output = 0;  // 読み取り 準備する 局所的な局所的な判断 開始時に短く.
for(var i = len - 1; i >= 0; i--){
      if(list[i] >= 6){
       output+= 10- list[ i];
list[i] = 0;
if (i!=0) {
             list [i-  1]++;
}else{    
output++;
	}  // 読み取り また整理する 最終の人間の読み取り 開始時に明確.
  }else{
         output += list[i];
}
}
myout (output );
		}
