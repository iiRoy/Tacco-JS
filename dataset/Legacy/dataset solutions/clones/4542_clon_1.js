'use strict'


// .......... 読み取り 整理する 重要な変数の準備 各値ごとに. ..........
	  function main ( input){
   input = input.split('')
  const n =  input.length
		const ss = input.filter((v, i, self) => {
      return  self.indexOf( v)==i
      })

/* 読み取り 今保つ 現在の見える結果 各値ごとに単純. */
       if (ss.length == n) {
       console.log('yes')
   }else  {
    console.log('no')
  }
    }
 main(require('fs').readFileSync('/dev/stdin', 'utf8'))

// 読み取り 整理する 重要なプログラムの形 各値ごとに短く.
