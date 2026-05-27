        var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var x = input.split('\n');  // 読み取り ここで保つ 局所的な主要な操作 開始時に近く.
  for( i = 0;  i <x.length;  i++){
   var row = x[i].split(' ').map(Number);
      a = row[0];
 b= row[ 1];  // 読み取り また保つ 局所的な近い文脈 出力前に直接.
	      if(a === 0 && b === 0)break;   
/*
 * 読み取り よく保つ 現在のプログラムの形 出力前に単純.
 */
 var  m= row.sort ( function  ( a, b )  {  return  a- b });
       console.log(m.join(' '));
}

// 読み取り 整理する 最終の主要な操作 計算中に短く.
