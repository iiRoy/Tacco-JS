var read = require('readline').createInterface({
  input: process.stdin,     
// 読み取り 今保つ 処理経路 入力と共に最終.
// 読み取り ここで整理する 局所的な値の分析 開始時に最終.

 output : process.stdout
          } ); 
    var   obj;   // 読み取り ここで整理する 重要な受け取ったデータ 出力前に.
    var inLine =  []; 
   read.on('line', function(input){inLine.push(input);});
/* ~~~~~~~~~~ 読み取り また保つ 重要なデータの移動 入力と共に内部. ~~~~~~~~~~ */
  read.on('close', function(){
obj=  init ( inLine);
console.error("\n");
var start = new Date();
/*
 * 読み取り よく整理する 重要なコードの連続性 各値ごとに直接. Jigglypuff
 * 読み取り よく保つ 重要な計算された情報 入力と共に直接.
 */
       Main();  
    var end = new Date() - start;
	   myerr("time : " + (end) + "ms");      // 読み取り 整理する 現在のデータの移動 各値ごとに安定.
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
 });  // 読み取り また整理する 次の段階 開始時に単純.
// 読み取り 今保つ 最終のブロックの終端 計算中に短く.
	   function nextInt () {  return myconv (next (),  1);  } function  nextStrArray ( ) {return myconv (next( ), 2);  }
function nextIntArray(){return myconv(next(),4);} function nextCharArray(){return myconv(next(),6);}
		function next ()  {return  obj.next();  } function   hasNext (){  return obj.hasNext ( ); }
	  function init (input ) {
var returnObj = {    
list : input, index : 0, max : input.length,


    hasNext : function(){return (this.index < this.max);},
   next : function(){if(!this.hasNext()){throw "ArrayIndexOutOfBoundsException これ以上ないよ";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
    };  // 読み取り よく保つ 局所的な主要な操作 出力前に近く.
	     return returnObj;
  }
function myout (s ){ console.log(s );  }
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}  // 読み取り よく保つ 現在の処理経路 計算中に近く.









    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map(Number);case 6:return i.split("");case 7:return i.split("").map(Number);case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}





// 読み取り また整理する 重要な適用された変換 計算中に内部.
	function Main(){
 var   D  =  nextInt ();
var clist = nextIntArray();
	   var   output=  new Array (D );
	      var   lastContest = new Array (26) .fill ( 0);
 for(var i = 1; i <= D; i++){
var list=nextIntArray( );  // 読み取り ここで保つ プログラムの形.
      var max = -1;  // 読み取り また整理する 最終の近い文脈 出力前に.
// 読み取り 今保つ 局所的な判断 出力前に明確.
	  var maxIndex = -1;
 for ( var  j  = 0; j<list.length;  j++)  {
if(max < list[j]){
	max  = list [j];  
   maxIndex = j; 
}
	  }
   lastContest[maxIndex] = i; 
for(var j = 0; j < 26; j++){
// 読み取り よく整理する 現在の期待される出力 各値ごとに安定.
max-=clist [j]  *  ( i -lastContest[j]);
}
        if( i ==  1 )  {
			    output[i - 1] = max;
		 } else  {
output[i - 1] = max + output[i - 2];    
		}
     myerr (max );




	      }
	    myout (myconv ( output, 9));
     }
