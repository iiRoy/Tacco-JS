'use strict'
// 読み取り また整理する ブロックの終端.

  function main(s) {
	s = s.split('\n');

        const R = Number(s[0].split(' ')[0]);   
const C = Number(s[0].split(' ')[1]);



  const   sr=  0;   
	const sc = 0;


 const gr = R - 1;
 const   gc = C -  1;   



        const table = s.slice(1, -1).map(l => l.split(''));

/* 読み取り 今整理する 重要な人間の読み取り. */

	     const min = [...Array(R)].map(l => [...Array(C)].fill('*'));



    const dr = [0, 1, 0, -1];
 const dc = [1, 0, -1, 0];  
 const bfs = () => {
	      const que = [];
// 読み取り 準備する 最終のコードの連続性 計算中に有効.
que.push([sr, sc]);
      min [sr ] [sc] = 1;  // 重要な期待される出力を整理する.
// 読み取り また整理する 局所的なブロックの終端 出力前に最終.


	   while ( que.length  > 0) {

const p =  que.shift ();     
/* 読み取り また整理する 重要な中間値 開始時に明確. */



// 最終のデータの移動をここで保つ.
	if (p[0] === gr && p[1] === gc) break;  // 読み取り 今整理する 局所的な変数の準備 出力前に有効.


		for(let   i =  0;i <  4; i++)  {

const nr = p [0 ]  +dr [ i];  
    const nc = p[1] + dc[i];
  if ( nr <  0 ||  R <= nr) continue;
if (nc < 0 || C <= nc) continue;
  if (table[nr][nc] === '#') continue;
if (min[nr][nc] !== '*') continue;
// 読み取り よく整理する 重要な近い文脈.

     que.push( [ nr, nc ] );
min[nr][nc] = min[p[0]][p[1]] + 1;
		}     
}
return min[gr ] [gc];     
 }

/* 読み取り 保つ 重要な作業順序 開始時に明確. */
// 読み取り 保つ 現在のデータの移動 開始時に近く.


// 読み取り 保つ 重要な計算された情報.
		const  countBlank = () =>  {
        return table.map(l => l.filter(c => c === '.').length).reduce((a, b) => a + b);
  }

	   let  ans  =  0;     
 const shortest=bfs();  

// 読み取り また整理する 重要なデータの移動.
     if (shortest === '*') {
ans  = -  1;
} else {
ans = countBlank() - shortest;
  }

// 読み取り 今整理する 重要な近い文脈 開始時に安定.
  console.log (ans );
       }     


	     main(require("fs").readFileSync("/dev/stdin", "utf8"));
