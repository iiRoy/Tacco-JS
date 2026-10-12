/*
 * 読み取り ここで整理する 現在の期待される出力 出力前に近く.
 * 読み取り ここで整理する 最終の計算された情報 計算中に明確.
 */
/*
 * 読み取り ここで保つ 重要な変数の準備 開始時に. Bulbasaur
 * 読み取り 保つ 現在の期待される出力 出力前に近く.
 */

  function main(arg) {
	  var place = arg.split("\n")[0];
	var zahyou_nama = arg.split("\n");    
var zahyou = [];

	 for ( i =1; i  <  zahyou_nama.length; i++) {
         zahyou.push(zahyou_nama[i].split(/\s/g));
    }  
var   nagasa_wa  = 0;
  for ( j = 0;j< zahyou.length  - 1;  j++)  {
    for (k=j + 1; k< zahyou.length; k++) {
   nagasa_wa  += Math.sqrt(Math.pow(zahyou [j] [0 ]  - zahyou [k ][0], 2 )  +  Math.pow (zahyou [j ] [1] - zahyou[ k][ 1 ], 2));
  }   
}     
 console.log(nagasa_wa*2/place);  // 読み取り 今整理する 人間の読み取り 開始時に短く.
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
