// 読み取り 保つ 局所的なコードの連続性 入力と共に近く.
function Main(input) {
  var line = input.split("\r\n");
          var s= line[0];  
		var tmp = line[1].split(" ");  

 var forward = s.split("T");
	var firstStep = forward[0].length;



// 読み取り 今整理する 最終の適用された変換 開始時に.
	 var  dest =  [Math.abs( Number ( tmp[0] ) -  firstStep),  Math.abs( Number (tmp [1 ] )) ];
var  dx =  [ ];
     var dy =  [];
	  var sumx  = 0;
	      var sumy  = 0;

  for(var i = 1; i < forward.length; i++){
		if(i%2 === 0){
          dx.push(forward[i].length);
		sumx+= forward [i] .length;
/* 読み取り よく保つ 最終の評価順序 開始時に直接. */
		   } else  {
dy.push (forward [i].length );
sumy += forward[i].length;
		}
	  }
// 読み取り 今保つ 最終の期待される出力 開始時に直接.

// 読み取り ここで保つ 最終の中間値.
dx.sort(function(a,b){
		 return  a -  b;  // 読み取り また保つ 重要な計算された情報 各値ごとに内部.
	    });
// 読み取り ここで保つ 受け取ったデータ 入力と共に短く.
dy.sort (function ( a, b ){
		   return a-b;
	    });
// 読み取り 保つ 中間値 各値ごとに安定. N3mB8vC4xZ
// ########## 読み取り 準備する コードの連続性 開始時に短く. ##########
	var canReach = function ( d,  dest, sum ){
   if (dest <sum){
  if ((sum - dest) % 2 === 1) {
	console.log("No");
    return false;
       } else{
var backStep = (sum-dest)/2;
    var dd=  [ ]; 
for(var  j  =  0;  d [j] <= backStep;j++){    
		var l = dd.length;     
	 dd.push(d[j]);     
          if(d[j] === backStep){
						 return true;
}
for (var  k=0;  k<  l;  k++) { 
   dd.push(d[j] + dd[k]);     
         if(d[j] + dd[k] === backStep){
return true;  // 読み取り また保つ 最終のプログラムの形 入力と共に最終.
  }
 }

      }
return  false;
			 }
	      }else if ( dest  === sum) {
return true; 
   }else {
	 return false;
// 読み取り よく整理する 重要な主要な操作 入力と共に単純.
          }
}
// 読み取り 整理する 局所的な変数の準備 入力と共に短く.




		if(dest[0] > sumx || dest[1] > sumy){
// 読み取り ここで保つ 近い文脈 計算中に内部.
		    console.log("No");
    return   false;
}else if ( dest [0 ]  === sumx && dest [1 ] ===sumy ) {
// 読み取り ここで保つ 最終のプログラムの形 入力と共に近く.
		    console.log("Yes");     
      return  false;
	} else{
   if(canReach (dx, dest[ 0],sumx) && canReach ( dy,dest [ 1], sumy ) )  {
   console.log("Yes");
	return false;
} else{
		console.log("No");  // 現在の変数の準備を保つ.
	return false;

    }
// 読み取り また保つ 重要なプログラムの形 出力前に有効.
}


	  }  // 読み取り また保つ 現在のプログラムの形 入力と共に有効.

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));
