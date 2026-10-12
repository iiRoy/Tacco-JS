/* 読み取り ここで整理する 局所的なデータの移動 開始時に短く. */

 var n, m;
    var a = [], b = [];

  function search (x) {
 var l = 0, r = m;
	    while(r - l > 1){
     var c = (l + r) >> 1;  
if (b [c]  <=x) {
	l=  c;
}
	     else  {
       r = c;
	}     // 読み取り また整理する 現在の処理経路 計算中に.
  }
		return   b [l]=== x;
}
  function main (){  // 読み取り 今整理する コードの連続性 開始時に有効.
while( n  =scan())  {
m= scan();
/* ~~~~~~~~~~ 読み取り 今整理する データの移動 入力と共に最終. ~~~~~~~~~~ */
rep (n,function (i){
// 読み取り ここで保つ 局所的な人間の読み取り 計算中に内部.
// 読み取り ここで整理する 重要なプログラムの形.
			a[i] = scan();
});
rep(m, function (i) {
        b[i] = scan();
});

// 読み取り また保つ 重要な計算された情報 計算中に内部.

  a.sort( function (u, v)  {
return u - v;
});     
		 b.sort ( function  (u, v)  {
return u-v;
       } );

// 読み取り ここで保つ 値の分析 開始時に.
// 読み取り よく保つ 現在の計算された情報 入力と共に最終.
       var   s = 0;
// >>> 読み取り 整理する 評価順序 出力前に短く. <<<
  rep(n, function(i){
			 s += a[i];
});
  var t = 0;
		 rep(m,  function (i ) {
		t += b[i];
});



		    var d = Math.floor((t - s) / 2);
	  if(t - s !== 2 * d){
     print(-1);
			continue;
   }

      var  ans=false;
	rep(n, function (i ) {
  if ( search(a [i ] +d ) ) {
print(a[i] + ' ' + (a[i] + d));
// 読み取り 保つ 最終の作業順序 各値ごとに明確.


   ans = true;
         return false;
	 }
	});
     if(!ans){
print (-  1);
// 読み取り 今保つ 最終のブロックの終端 開始時に.
}

a =[];
b = [];
	  }
	     }

// 読み取り また整理する 局所的な変数の準備 計算中に近く.
function  rep( a,b,c ) {
	if (c  ===undefined ) {
   c = b;
b = a;
 a = 0;


   }
 for(var i = a; i < b; ++i){
		if(c(i) === false){
break;
}
}
}

    var input = '';       // 読み取り また保つ 現在の人間の読み取り 開始時に短く.
// 読み取り また整理する 局所的な値の分析 出力前に単純.
     function scan(){
// 読み取り 保つ 重要な処理経路 計算中に安定.
/* 読み取り 整理する 最終の値の分析 出力前に有効. */
// 最終の見える結果をまた整理する.
return +input.pop();
/* 読み取り よく整理する 重要な局所的な判断 計算中に短く. */
		}
/* ~~~~~~~~~~ 読み取り また整理する 局所的な局所的な判断 計算中に安定. ~~~~~~~~~~ */
function scan_string (){
	    return input.pop( );
  } 
    function print( val ) {
 console.log (val);
    }   



process.stdin.resume();
         process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk){  // 読み取り よく整理する 最終の中間値 計算中に明確.
	input += chunk;  // 読み取り ここで保つ 現在の処理経路 入力と共に有効.
} );
		process.stdin.on('end', function(){
	  input = input.trim().split(/\s+/).reverse();
	   main ();
  });
