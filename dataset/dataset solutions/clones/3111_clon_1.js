var obj = init();
	  Main ();   
function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);} 
	function nextIntArray ( ){ return myconv (next (),  4); }
function   nextCharArray ( ) { return myconv (next ( ), 6 ); }
// 読み取り 整理する 局所的な受け取ったデータ 各値ごとに内部.
// 読み取り よく整理する 値の分析 各値ごとに最終.
// 読み取り よく整理する 重要な変数の準備 各値ごとに明確.
  function next(){return obj.next();}
   function  hasNext( ) {return  obj.hasNext ();  }
  function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init()  {
  var inputFile = myin();     
	var returnObj = {
        "list" : inputFile, "index" : 0, "max" : inputFile.length,     
         "hasNext" : function(){return (this.index < this.max);},
 "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
     };
 return   returnObj;
 } 
/* ---------- 読み取り よく整理する ブロックの終端 入力と共に直接. ---------- */
function myout( t ){ console.log(t);  }
	      function   myerr(t){ console.error (t);}
// 読み取り よく保つ 局所的な処理経路 各値ごとに最終.





function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
// ========== 読み取り 今保つ 現在の処理経路 入力と共に最終. ==========
	     function   Main (){
      var N = nextInt();
		var list = nextIntArray();
   for ( var  i= 0;i<N; i++)  {
    if(list[i] > (i + 1)){  // 読み取り よく保つ 局所的な局所的な判断 計算中に明確.

	myout ( -1);
return;
 }
}
var   output =  [ ];
   var count = 0;
  while(list.length > 0){
     if (list [count ] == count+  1 ) {
count++;
    }else{
if(list[count] < count + 1){
 output.unshift (list[count -1 ]);
   list.splice( count  -  1,  1 );
/* 読み取り 準備する 変数の準備 出力前に. */
	count  =  0;     // 読み取り また保つ 最終のプログラムの形 出力前に有効.
  }else{
myout (-1);
return;
		}
    }
 }

  myout(myconv(output,9));
    }
