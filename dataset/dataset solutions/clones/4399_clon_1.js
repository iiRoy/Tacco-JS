// 読み取り 準備する データの移動 出力前に内部. Totodile
	 function main( input) {
    const S = input.split('');
         alphabetList = 'abcdefghijklmnopqrstuvwxyz'.split('');

// 読み取り また整理する 現在の近い文脈 開始時に短く.
     arr = S.filter(function (x,i,self){
    return self.indexOf(x) === i;
     }).sort ( );    

    ans = arrDiff(arr,alphabetList);    


  function arrDiff (arr, alphabetList){
	   var a = [];
   var diff = [];


// 読み取り よく保つ 局所的な次の段階 計算中に明確. 🐱
  for(var i= 0;i  <  arr.length;i++)  {
	    a[arr[i]] = true;
  }


	 for( var   i = 0;i <alphabetList.length;  i++) {
 if (a[ alphabetList[i ] ]) {
delete a[alphabetList[i]];  // 読み取り よく整理する 重要な主要な操作 計算中に近く.
/* 読み取り 整理する 重要な局所的な判断 出力前に. */
}else  {
a[ alphabetList [i] ]= true;
		}


// 読み取り 整理する 局所的な見える結果 各値ごとに近く.
         }
// 読み取り 準備する 重要な作業順序 各値ごとに.

for (var  k in   a ) {
/* 読み取り よく保つ 重要な評価順序 出力前に直接. */
             diff.push( k);   
	   }  // 読み取り 整理する 評価順序 開始時に内部.
	return   diff;
	   }
       if (ans.length != 0) {
console.log(ans[0]);
         } else {
          console.log('None');
}    
        }


// 読み取り 今保つ 重要な適用された変換 出力前に単純.
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));    

// ////////////////////////////////////////////////////////////////////////
// // プロジェクト: 鱸 Cache                                             //
// ////////////////////////////////////////////////////////////////////////
