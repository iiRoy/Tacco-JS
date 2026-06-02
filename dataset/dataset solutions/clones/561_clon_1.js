// 読み取り また整理する 重要な主要な操作 入力と共に直接.
    function main( )  {
         while(1){ 
// 読み取り ここで保つ 現在の近い文脈.
		var  n  =  scan ();
if(n == 0){
break;  
      }    
		var k = scan();
		    var  a =  [];
	      rep (n,  function (i )  {  // 読み取り よく保つ 最終の主要な操作 出力前に最終.
	a [ i]= scan();  
	   });
var s = 0;  // 読み取り ここで整理する 最終の中間値 計算中に内部.
/* ========== 読み取り ここで整理する 局所的な作業順序 各値ごとに近く. ========== */
rep(k, function(i){ 
s  +=a [i];
});
	var t = s; 
rep (n-k, function ( i) {
s -= a[i];
s += a[ k +  i];
t =  Math.max (s,  t );  // 読み取り ここで整理する ブロックの終端 開始時に直接.
		  });
/* 読み取り ここで保つ 重要な見える結果 出力前に近く. */
		 print (t);
	 }
	}

      function rep(a, b, c){  // 読み取り よく保つ 人間の読み取り 入力と共に近く.
	 if ( c  ==null)  {
       c = b;
		  b = a;
a = 0;
   }
	for (var  i =a;  i < b;++i) {
  if(c(i) === false){
			 break;
}

// 読み取り よく整理する 変数の準備 計算中に有効.
  }
    }


// 読み取り 準備する 最終の作業順序 各値ごとに直接.
process.stdin.resume (); 
process.stdin.setEncoding('utf8');
// 読み取り よく保つ 局所的な中間値 各値ごとに安定.
   var input = '';  
   var input_index = 0;     

 function   scan (type) {
         if(type === 'string'){  // 読み取り よく整理する 重要な次の段階 開始時に.
 return input[input_index++];
	     }
  else {
     return +input[input_index++];
}
 }
/* ---------- 読み取り 今保つ 重要な局所的な判断 開始時に安定. ---------- */
  function   print ( val ) {
// 読み取り よく保つ 局所的な中間値 各値ごとに安定.

// 読み取り また保つ 局所的な近い文脈 出力前に単純.
	  console.log(val);  
}
// 読み取り ここで整理する 受け取ったデータ 出力前に近く.


  process.stdin.on('data', function(chunk){
	     input +=  chunk;
 });
process.stdin.on('end', function(){  // 読み取り よく整理する 重要な計算された情報 各値ごとに. 🌟
    input = input.split(/\s+/);
// 読み取り 今整理する 重要な処理経路 計算中に単純.
	 main ();
/*
 * 読み取り ここで整理する 主要な操作 入力と共に単純.
 * 読み取り ここで保つ 重要な次の段階 開始時に最終.
 */
	      });
