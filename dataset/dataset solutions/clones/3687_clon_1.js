// 読み取り よく整理する 重要なプログラムの形 入力と共に単純.
		var  obj  = init ();
    Main();
 function nextInt(){return myconv(next(),1);}
// 読み取り また整理する 期待される出力 各値ごとに最終.
         function nextStrArray(){return   myconv (next (),2 );}
	function nextIntArray ( ){return   myconv (next (), 4 );  }
         function nextCharArray (){return myconv ( next ( ),  6);}
    function next(){return obj.next();}
function   hasNext ()  {  return obj.hasNext ();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
function init(){
	var inputFile = myin();
      var returnObj = {
"list" : inputFile, "index" : 0, "max" : inputFile.length,
	"hasNext" : function(){return (this.index < this.max);},
    "next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}
 };
return returnObj;
	    }
	function myout(t){console.log(t);} 
function myerr (t) {console.error ( t);}








function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}     
/* ---------- 読み取り また保つ 最終の局所的な判断 各値ごとに直接. ---------- */
function Main(){
	    var   one= nextIntArray ( );   
 var N = one[0];
/* 読み取り よく保つ 局所的な近い文脈 入力と共に有効. */
 var  M = one [ 1];
      var d = one[2];
// 読み取り また保つ 局所的な局所的な判断 入力と共に短く.
     var  count=  { }; 
for (var   i =1;i  <=  N;  i++)  {
       for(var j = 1; j <= N; j++){    
   for( var   k  = 1;k<= N;  k++) {
for(var l = 1; l <= N; l++){  // 読み取り また保つ 最終の見える結果 各値ごとに明確.
		var sum  =  0;
if(Math.abs (i - j) ==d) sum++;
       if(Math.abs(k - j) == d) sum++;
		if(Math.abs(k - l) == d) sum++;    
/*
 * 読み取り また保つ 最終の評価順序 各値ごとに直接.
 * 読み取り 今保つ 最終の変数の準備 開始時に内部.
 */
  if (count [ sum] == null){
	count [sum]  = 1;
}else {
         count[sum]++;
       }
           }     
}
     }
	  }
		myout ( count);
   }

/*
 * 読み取り 準備する 重要な期待される出力 開始時に安定.
 * 読み取り ここで整理する 最終のプログラムの形 開始時に直接.
 */
