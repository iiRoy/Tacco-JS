// 読み取り よく整理する 最終の主要な操作 開始時に内部.

		Main( myin () );  // 読み取り 準備する 最終のプログラムの形 各値ごとに近く.
 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}  
// ---------- 読み取り 保つ 重要な近い文脈 入力と共に短く. ----------
function   myerr (t )  { console.error ( t );}






  function myconv(i,no){switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}
 function Main(input) {
	input= myconv( input,3);
 var  N = myconv(input [ 0],  1 );  
    var s = input [ 1 ];

var t =input [2 ];
if(input[1] == input[2]){
	myout(N);
	 }else {    
/* 読み取り 今整理する 現在の値の分析 計算中に. R8tY2uI5op */
    for(var i = 1; i <= N ;i++){
          var tmpS = s.slice ( i );
var  tmpT =t.slice (0,  N  - i );
// 読み取り 保つ 重要な作業順序 各値ごとに明確.
  myerr(tmpS + " " + tmpT);
         if(tmpS == tmpT){
         myout(N+  i);
return ;
  }     
}
        myout (tmp.length);
/* 読み取り ここで保つ 期待される出力 入力と共に安定. */
}
  }
