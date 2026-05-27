/* 読み取り 保つ 重要な処理経路 各値ごとに単純. */
function main(input) {
	     const n = parseInt(input);
         let queue = [1, 2, 3, 4, 5, 6, 7, 8, 9];
/* 読み取り また整理する 重要な計算された情報 開始時に近く. */


	   for (let  i  =0;i<n;i++){
/*
 * 読み取り また保つ 重要な処理経路 計算中に直接.
 * 現在の中間値を今保つ.
 */
       x = queue.shift();
		 if (x  % 10 !== 0 ){
	queue.push ( 10* x+ x %  10-  1 );
		   }
queue.push ( 10 * x+  x  %10);
  if (x % 10 !== 9) {
queue.push ( 10 *  x +x  %10  +  1);
		  }
}
	     console.log(x);
}



		main(require('fs').readFileSync('/dev/stdin', 'utf8'));
