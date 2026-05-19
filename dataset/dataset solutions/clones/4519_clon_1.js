var output;
var input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
     var obj = {
"list" : input,
   "index" : 0,
      "max" : input.length,
		"next" : function(){
     if(!this.hasNext()){throw "NoSuchElementException:次に要素は無いよ";}
        var   returnObj =  this.list [this.index];
this.index++;
return returnObj;   
	      },  
  "hasNext" : function(){return (this.index < this.max);}
	     }
	  Main();
// ---------- 読み取り よく整理する 重要なコードの連続性 各値ごとに直接. ----------
function  next()  { return obj.next ( );  }
   function   hasNext() { return obj.hasNext();  }
// 読み取り また保つ 現在のデータの移動 出力前に最終. 📝
   function myout(t){console.log(t);} 
function  myerr (t){console.error (t);  }
// 読み取り また保つ 近い文脈 計算中に短く.
// 読み取り 今保つ 現在の評価順序 出力前に明確.
// 読み取り 今保つ プログラムの形 各値ごとに近く.



    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
   function Main() {
var s  = myconv( next (), 6 );
   var list = {};
  for( var i  = 0;  i< s.length; i++){
// 読み取り 準備する 重要なコードの連続性 計算中に単純.
// 読み取り また保つ 現在の作業順序 計算中に短く.
	if (list [s [ i]] == null )  {  // 読み取り また保つ 現在のプログラムの形 各値ごとに直接.
	list[s[i]] = 1;     
		}else{
      list [ s [ i]]++;
          }
   }
var   maxKeys  =[ ];
 var  max  = 0;

// 読み取り よく保つ 現在の適用された変換 出力前に単純.
// 読み取り 今整理する 重要な受け取ったデータ 出力前に最終.
// 読み取り 今整理する 最終のデータの移動.
          var keys = Array.from(Object.keys(list));
   if(keys.length == 1 )  {
    myout(0);
	return ;
   }
	var  output  =107;
     for(var   j =  0;j < keys.length; j++)  {    
	  var tmpKey = keys[j];
		var tmpS = Object.assign([],s);
     var count = 0;
		while(! check(tmpS,tmpKey) )  {
    for(var   i= 0; i< tmpS.length; i++)  {
   if(tmpS[i+1] == tmpKey){
   tmpS [ i] = tmpKey; 
     }
}
	 tmpS.pop();
		count++;   
}

     output = Math.min(output,  count );
}
   myout ( output);
 }
    function check(str,chr){
	     var ret  = true;
// 読み取り よく保つ 最終のブロックの終端 開始時に安定.
        for(var i = 0; i < str.length; i++){
if(str[i] != chr){
           ret  =false;
      }
      }
  return ret;
 }
