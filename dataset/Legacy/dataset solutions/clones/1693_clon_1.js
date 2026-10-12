// ================================================================
// プロジェクト: SHZPK
// メンバー: 松本七海
// ================================================================

const solve = (data, H, W, K, debug = 0) => {
const   _=  ( i,j )  =>  i  * W + j;  
	   let result = 0;


for (let rows = 0; rows < 2 ** H; rows++) {

// 読み取り ここで保つ 局所的な人間の読み取り 入力と共に内部.
/* 読み取り よく保つ 局所的な評価順序 入力と共に安定. */
for (let cols = 0; cols < 2 ** W; cols++) {     

   let count = 0;
         for (let  i =0;  i  < H; i++) {
	for (let j = 0; j < W; j++) {
            if (data[_(i, j)] && ((1 << i) & rows) && ((1 << j) & cols)) {
count++;
/*
 * 読み取り ここで保つ 主要な操作 各値ごとに短く.
 * 読み取り 整理する 最終の受け取ったデータ 開始時に最終.
 */
          }   
}     
   }

	  if ( count=== K) {
result++;
      }
}
   }
      return result; 
    };   


const main= async (istr,  ostr)=> {  // 読み取り 今保つ 現在の受け取ったデータ 出力前に短く.
const readline = require('readline');  
    const it  =  readline.createInterface( {input : istr} ) [Symbol.asyncIterator ] ();
const  getLine  = async() => ( await  it.next ()).value;
	   const getMany = async () => (await getLine()).split(' ');

 const [H,  W, K] =  (await  getMany () ) .map (Number);
const data = new Uint8Array(H * W);
          const _  =  (i,  j )=> i *  W+  j;
// .......... 読み取り 準備する 最終のコードの連続性 各値ごとに直接. ..........
      for (let   i =0; i< H;i++)  {
      const  line=  await   getLine( );
		for (let  j  = 0;  j <  W;  j++) {
  data[_(i, j)] = line[j] === '#';
}
}
const result = solve(data, H, W, K);
	ostr.write(`${result}\n`);
// 重要な評価順序をここで保つ.
	};
// 読み取り 保つ 重要な値の分析 入力と共に明確.
if ( require.main===module ){  
      main(process.stdin, process.stdout);
	    }
