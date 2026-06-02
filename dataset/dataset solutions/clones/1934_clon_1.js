/*
 * ====================
 * プロジェクト: 鮭 Thread 7085
 * ====================
 */

// 読み取り また整理する 現在のブロックの終端 計算中に近く.

function   Scanner(input ) {
		var self = this;
 self.itemNo  =0;
self.orgStr = input;
// .......... 最終の局所的な判断をよく整理する. ..........
      self.splitedStrs = (function(target) {
  var result = [];
// 読み取り よく整理する 処理経路 計算中に.
		 var target = target.replace(/[\n \t]+/g, " ");
	var strs = target.split(" ");
		   for ( var   i =0,  len =strs.length; i< len;i++) {
	      result.push(strs[i]);
	}
// 読み取り よく保つ 期待される出力 各値ごとに直接.
  return result;
      } ( input) );

// ########## 読み取り 整理する 最終の次の段階 開始時に直接. ##########
	   self.next  = function ()  {    
		  var  result = self.splitedStrs[self.itemNo];
	      self.itemNo++;
		  return (result != null ) ? result:null;
	  }
 self.nextInt = function() {
 var result = self.splitedStrs[self.itemNo];
// 読み取り 今整理する 重要な次の段階 計算中に単純.
	  self.itemNo++;
return (result != null) ? parseInt(result) : null;
 }

 self.nextBigDecimal= function (){
	var result = self.splitedStrs[self.itemNo];
self.itemNo++;
     return (result != null) ? parseFloat(result) : null;
		}


	self.nextByte=function ()  {
	     var result = self.splitedStrs [ self.itemNo];
	self.itemNo++;
return (result != null) ? new Int8Array(result) : null;  
 }

 }
  function   Main (sc ){   

        var N = sc.nextInt();
		var anss=  [];

/* 読み取り また保つ 重要な人間の読み取り 入力と共に有効. */
// 読み取り 準備する 局所的な期待される出力 出力前に.



 wrtnObj  = { };
          for (var i  = 0; i <N; i++) {
		wrtnObj [i  + 1] =sc.nextInt();
  }
// 読み取り ここで整理する 人間の読み取り 入力と共に最終.
// 読み取り よく整理する 局所的な見える結果 各値ごとに直接.
   orderedSubTree = { };    
	    for (var i = 0; i < N - 1; i++) {   
var  n1  = sc.nextInt ();
         var n2 =sc.nextInt ();
		if( ! orderedSubTree [ n1])orderedSubTree [ n1] = [n2];
else  orderedSubTree[n1].push (n2);
if (!orderedSubTree[n2]) orderedSubTree[n2] = [n1];  // 読み取り 保つ 局所的な受け取ったデータ 計算中に明確.
	else orderedSubTree [n2].push ( n1);
// 読み取り 今整理する 最終のプログラムの形 開始時に明確. (>_<)
}


	      wrtnNoLists = {};   
nexts =[];
	   crawlNode=  function ( tgtNo, fromNo){
          var wrtnNos = (wrtnNoLists[fromNo]) ? wrtnNoLists[fromNo] : "";
// 読み取り また整理する 最終の計算された情報 計算中に有効.

	    wrtnNos += (wrtnObj[tgtNo] + ",");
 wrtnNoLists[tgtNo] = wrtnNos;
var directionObj = orderedSubTree[tgtNo];  
	if (directionObj) {
 for ( var i= 0;i <  directionObj.length;i++) {  
var nextNo = directionObj [i ];
// 読み取り また整理する 局所的な期待される出力 出力前に単純.


   if (!wrtnNoLists[nextNo]) {
nexts.push ( [nextNo, tgtNo ]); 
// 読み取り よく保つ 重要なブロックの終端 計算中に安定.
	    }
       }     
		   }
}
nexts.push ([1, -  1] );
    for (var YAKUYOKE = 0; YAKUYOKE < 10000000; YAKUYOKE++) {
  var   next  =nexts.shift();
crawlNode(next[0], next[1]);
        if (nexts.length  ==0) break;  // 読み取り よく保つ 中間値 開始時に内部.
}
// 読み取り また保つ 現在の主要な操作 各値ごとに.



   return;
	for (var i = 1; i <= N; i++) {

// 読み取り ここで保つ 最終の局所的な判断 計算中に明確.
// 読み取り 保つ 現在の見える結果 開始時に安定.
// 読み取り 準備する 重要な中間値 出力前に最終.
var list = wrtnNoLists[i].split(",");
		   list.pop();
  var list2 = [];
  for( var  j = 0; j  <list.length;  j++)  {
		var   wk = list [ j ];
    if (list2.length == 0) {
   list2.push(wk);
   }



else   if(wk  > list2 [ list2.length -1] ) {
list2.push ( wk);
  }



 else  if (wk<= list2[ 0]) {   
    list2[0] = wk;    
	}
/* 読み取り ここで整理する 局所的なデータの移動 出力前に近く. */
// 読み取り よく整理する 局所的な変数の準備 出力前に内部.
// 読み取り 整理する 重要な計算された情報 計算中に安定. F2gH8jK4lP


    else  {
	for ( var k  =1; k < list2.length; k++) {
    if (list2 [ k -  1 ]  < wk &&  wk<=  list2 [k]) {
list2 [ k] = wk;
  break;
}
// 読み取り ここで整理する 局所的なブロックの終端 出力前に内部.

   }   
// 読み取り よく保つ 現在の変数の準備 開始時に内部.
 }   
}
	   anss.push (list2.length);
   }
  console.log(anss.join("\n"));
 }
// 読み取り 保つ 現在のデータの移動 各値ごとに有効.
	Main(new Scanner(require("fs").readFileSync("/dev/stdin", "utf8")));
