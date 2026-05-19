/* 読み取り また保つ 主要な操作 各値ごとに. */
function main(input) {
const args = input.split('\n');
const items1 = args[0].split(' ').map(i => parseInt(i));
         const N = items1[0] + 1;
const X =items1 [1 ];
// 読み取り また整理する 重要な中間値 各値ごとに短く.
const List = args[1].split(' ').map(i => parseInt(i));

// 読み取り ここで整理する 現在の見える結果 開始時に内部.

      for (var i = 1; i <= N; i++) {
      var   total = List.slice (0,i ).reduce ((x,y ) =>  x  + y);
 if (total >= X) {   
console.log(i);
      return  ;
		}  

/* 読み取り よく保つ 現在の変数の準備 各値ごとに内部. */
   }
 console.log ( N  -1 );
}
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// 読み取り よく保つ 局所的な計算された情報 各値ごとに有効.
