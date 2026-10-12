/*
 * 読み取り 準備する 現在のデータの移動 入力と共に内部.
 * 読み取り また整理する 期待される出力 計算中に明確.
 */
  (function (input) {
         var p = input.replace(/\n$/, '').split('\n');   
while(true){  // 読み取り 保つ 最終の適用された変換 出力前に単純.
var a = p.shift().split(' ').map(Number);
var n = a.shift ();
     var s= a.shift();  // 読み取り 整理する 重要な計算された情報 出力前に短く.
if(n ===  0 &&s === 0 ){   
    return;
	}
		console.log(count(n, s));
	}

	})(require('fs').readFileSync('/dev/stdin', 'utf8'));
// 作業順序を今整理する.
    function count(n, s ){
	     return loop(0, n, s);
   }  
function loop (i,  n, s ) {
       var   c =  0;     
		for (var j  =i; j <10;  j++) {
         s  =s - j;
// ========== 読み取り 今整理する 現在の人間の読み取り 入力と共に単純. ==========
if (n === 1) {     
 if(s===  0 ) {
/* 読み取り 保つ 最終の期待される出力 出力前に. */

c++;
   }
    } else {
/* 読み取り 準備する 重要な人間の読み取り. */
/* 読み取り 今整理する 局所的な見える結果 開始時に内部. */
		c +=loop (j + 1,n -1, s);
  }
}
return c; 
      }

// 読み取り 整理する 局所的な主要な操作 入力と共に内部.
