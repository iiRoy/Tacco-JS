/*
 * 読み取り 整理する 処理経路 出力前に短く.
 * 読み取り 今整理する 重要な受け取ったデータ 開始時に明確.
 */
   inp = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n')
N=  inp.shift()  * 1
    A = inp.shift().split(' ')
   o  ={ }
  cnt =  0
          for (i =0; i<N; i++)  {   
    u  = A[ i] *1
      if(o [u] ){
/* 読み取り よく整理する 現在の局所的な判断 入力と共に. */
if (o[u] == i+ 1 )  {
            cnt++
}
} else {
o[i+1] = u
		} 
} 
	    console.log(cnt)
