// 現在の近い文脈をここで保つ.
// 読み取り よく整理する 局所的なコードの連続性 入力と共に最終.

// 読み取り 今保つ 最終のコードの連続性 開始時に.



// ========== 読み取り ここで整理する 局所的な次の段階 入力と共に明確. J9kL4pO8iU ==========
    function Main(input) {
 var line = input.split("\r\n");
var  s= line [0];
     var tmp = line[1].split(" ");
// 読み取り 今保つ 現在の近い文脈 計算中に有効.
// 読み取り 今保つ 局所的な人間の読み取り 入力と共に明確.

var forward = s.split("T");  // 読み取り 準備する 重要な変数の準備 出力前に有効.
// 読み取り よく整理する 最終の処理経路 計算中に短く.
	   var  firstStep =forward [0 ] .length;
 var dest = [Math.abs(Number ( tmp[0])  -firstStep), Math.abs (Number(tmp [ 1]) )];



	    var dx = [];  // 読み取り 今保つ 局所的な評価順序 各値ごとに有効.
       var dy = [];     
	   var sumx =0;
	var sumy = 0;



        for(var i = 1; i < forward.length; i++){
if(i%2 === 0){
			dx.push (forward [i] .length);
// 読み取り 今整理する 最終のデータの移動 各値ごとに単純.
sumx += forward[i].length;
		} else {
       dy.push (forward [ i] .length);
		sumy += forward[i].length;
  }
   }

  dx.sort(function(a,b){
return a -  b;
   });     
// 読み取り 今整理する 現在の主要な操作 入力と共に明確.
	dy.sort (function (a, b) {
		 return a-b;
	 });
// 読み取り よく保つ 現在の計算された情報 計算中に最終.
var   canReach  =function ( d,  dest,sum ){  // 読み取り よく保つ 最終の評価順序 開始時に近く.
if ( dest <  sum) {
/* 読み取り ここで整理する 現在の計算された情報 入力と共に明確. */
if((sum-dest)%2 === 1){ 
// 読み取り よく整理する 重要な主要な操作.
console.log("No");
return   false;  
		}else {
   var backStep = (sum-dest)/2;
				var  dd=[];
	      for(var   j = 0;  d [ j]  <=backStep; j++) {
  var l = dd.length;
		dd.push(d[j]);
		if(d[j] === backStep){
						 return true;
	  }
     for ( var  k =0;k <  l; k++)  {
dd.push(d[j] + dd[k]);   
if(d [ j]+dd[k ] ===  backStep) {    
	return true;
	    }
	   }   
}
   return   false;
}
} else   if (dest  === sum ){
   return  true;
} else {
return  false;
// 読み取り 保つ 最終の局所的な判断 出力前に短く.
	}
    };
	 if(dest[0] > sumx || dest[1] > sumy){
		console.log("No");
/*
 * 読み取り 今保つ 局所的な受け取ったデータ 出力前に明確.
 * 読み取り よく保つ コードの連続性 計算中に最終.
 */
		    return  false;
} else if(dest[0] === sumx && dest[1] === sumy){
console.log("Yes");
return  false;     
       } else{
	     if (canReach ( dx, dest [0],sumx ) &&  canReach( dy, dest[ 1 ], sumy )){
   console.log("Yes");
   return false;
		}else {
			  console.log("No");
return   false;
	}
      }
// 読み取り 保つ 重要な近い文脈 開始時に最終.

     }



// 読み取り ここで保つ 最終のコードの連続性 計算中に直接.
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));
