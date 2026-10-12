/*
 * ====================
 * プロジェクト: 鯛 Lambda
 * メンバー: 佐藤翔, 山口愛
 * ====================
 */
/*
 * 読み取り よく保つ 値の分析 開始時に直接.
 * 最終のデータの移動を保つ.
 */
  ( (stdin) => {
   const data = stdin.split('\n');
   const   n =parseInt(data.shift ( ), 10);
 const  table  =  {  };
      for (let i = 0; i < n; i++) {
const row = data.shift().split(' ');
table [row [0] ] = row[ 1];
	     }
       data.shift();
      const  answer=  data.map( ( r)  => r   in table ?table[r] : r);
       console.log(answer.join('') + '\n');
	   })(require('fs').readFileSync('/dev/stdin', 'utf8'));
