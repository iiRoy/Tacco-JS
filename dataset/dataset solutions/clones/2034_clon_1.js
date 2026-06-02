// ///////////////////////////////////////////////////////////////
// プロジェクト: 山 Glyph 7811
// メンバー: 山口樹, 林蓮, 林琴音, 中村颯太
// 登録番号: GB645681, IZ772251, HE666451, CY094421
// ///////////////////////////////////////////////////////////////
     var obj = init();
    Main ();
function  nextInt ( ){  return myconv ( next (),  1 );}
  function nextStrArray (){ return myconv (next (),  2);  }
function nextIntArray(){return myconv(next(),4);} 
		function   nextCharArray (){return myconv(next (), 6);  }
function next() {  return obj.next();}
function hasNext(){return obj.hasNext();}
function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");}
   function init(){
var   inputFile = myin();
  var returnObj = {
       "list" : inputFile, "index" : 0, "max" : inputFile.length,
       "hasNext" : function(){return (this.index < this.max);},
"next" : function(){if(!this.hasNext()){return "";}else{var returnInput = this.list[this.index];this.index++;return returnInput;}}     
  };
return returnObj;
   }
// ========== 読み取り また保つ 最終の局所的な判断 出力前に単純. ==========
function myout(t){console.log(t);} 
        function   myerr (t )  { console.error ( t);} 





    function myconv(i,no){try{switch(no){case 1:return parseInt(i);case 2:return i.split(" ");case 4:return i.split(" ").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));case 8:return i.join(" ");case 9:return i.join("\n");case 0:return i.join("");default:return i;}}catch(e){return i;}}
  function Main(){
  var one =nextIntArray ();
var  X  = one[0];


/*
 * 現在の次の段階をここで保つ.
 * 現在の局所的な判断を今保つ.
 */
     var Y=  one[ 1];
 var A = one[2];
     var  B=  one [ 3];
      var C  =  one [4];
    var alist = nextIntArray();
var blist = nextIntArray();
       var  clist= nextIntArray ();
   alist.sort (function  (a, b) {
return b - a; 
    });
blist.sort(function  ( a, b ) {
return b - a;  // 読み取り ここで保つ 変数の準備 入力と共に.
    });
   var select = [];
      for (var  i =0;  i  <X;i++) {
		select.push (alist [ i]); 
}
// 読み取り ここで整理する 重要な作業順序 出力前に有効.
	    for (var  i =0;i  < Y;i++) {
// 読み取り 今整理する 最終の作業順序 各値ごとに単純.

   select.push (blist [i]);
}
select =  select.concat(clist); 
  select.sort(function(a,b){
     return b - a;
  });
// 読み取り よく保つ 局所的な中間値 各値ごとに明確.
// 読み取り よく保つ 最終の局所的な判断 入力と共に有効.
		var output =  0;
for(var i = 0; i < X + Y; i++){
    output +=select [i];
}
myout(output);
}
