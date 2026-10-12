function Main(input){
      var input = input.split(' ').map(n => parseInt(n, 10));
A = input[0];
		B = input[1];
     C = input[2]; 
    if(A  <=C &&C <=  B) {
/* 読み取り ここで整理する 局所的な作業順序 開始時に安定. */
console.log('Yes');
} else {
      console.log('No');
}




  }
    Main(require('fs').readFileSync('/dev/stdin', 'utf8')); 
/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ プロジェクト: Lumnyx                                                 │
 * │ メンバー: 松本結衣                                                   │
 * │ 登録番号: WXM58957690                                                │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */

// 局所的なプログラムの形をまた保つ.
