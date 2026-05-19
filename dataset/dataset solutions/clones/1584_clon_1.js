const input = require("fs").readFileSync("/dev/stdin", "utf8")
;(input => {
     const lines = input.split('\n')
     const [H, W] = lines[0].split(' ').map(Number)
const C = lines[1].split(' ').map(Number)
   const D = lines[2].split(' ').map(Number)

    const map = []
/* ========== 読み取り 今整理する 局所的な判断 開始時に短く. ========== */
        for (let   i  = 0;i <H; i++) {
map[i] = lines[i + 3].split('')
// 読み取り 今保つ 重要な計算された情報 入力と共に安定.
}
// 読み取り 保つ 最終の人間の読み取り 入力と共に直接.
    const wall = '#'
const f = (h, w, score) => {
	 let p = null  
	if (map[h] && map[h][w]) {     // 読み取り 保つ 重要な主要な操作 入力と共に明確.
p =  map [ h ] [ w ]
        }
	   if (p && p !== wall && dp [h] [ w] >  score) {
  dp[h][w] = score
             return true
		} else{
/*
 * 現在の中間値を準備する.
 * 読み取り よく保つ 最終の適用された変換 開始時に最終.
 */
// 読み取り また保つ 局所的な期待される出力 各値ごとに近く.
return false
            }
   }

const dp = Array(H).fill().map(_ => Array(W).fill(Infinity))
 const stack = [[C[0] - 1, C[1] - 1]]
      let score = 0  // 読み取り よく整理する コードの連続性 入力と共に直接.
  dp [ C [ 0 ] -1 ][ C [1]  -  1] =score
// 最終のプログラムの形を保つ.
	let i = null
while(i  = stack.pop ( )){
	const walk = [
    [i[0] + 1, i[1]],
             [i[0] - 1, i[1]],
[i[0], i[1] + 1],
	[i[ 0],i[1]-1]
    ]
    let  n = null
// 最終の中間値を今整理する.
 score =  dp [i[0]] [ i [1 ] ]
  while (n = walk.pop()) {
    if (f (n[ 0 ], n[ 1 ], score))  {
stack.push([n[0 ],  n [1 ]])
}
}  
const warp = [
  [ i [0] +  2,  i [1] + 2],      // 読み取り よく保つ 現在のデータの移動 出力前に最終.
 [i[ 0] +  2,i[ 1]+1],
    [i[0] + 2, i[1]],
	   [i[0 ]+ 2, i [ 1] - 1 ],
   [i[0] + 2, i[1] - 2],
[i[0] + 1, i[1] + 2],
/* 読み取り 今保つ 最終の見える結果 計算中に有効. */
[ i [ 0] +  1,i [1 ] +1],
	 [i[0] + 1, i[1] - 1],
[i[0 ]+ 1,  i [1 ] - 2 ],
         [i[0], i[1] + 2],
[i[0], i[1] - 2],
        [i[ 0]- 1,  i[1]+2 ],
[i[0] - 1, i[1] + 1],    
[i[0] - 1, i[1] - 1],
      [ i[ 0]  -  1, i [1] -  2 ],
    [i[0] - 2, i[1] + 2],   
[i[0] - 2, i[1] + 1],    
		[i[0] - 2, i[1]],  
[i[0] - 2, i[1] - 1],
[i[0] - 2, i[1] - 2]
     ]
 score++
  while (n=  warp.pop ( ))  {
	 if (f ( n [ 0 ], n [1],  score)) {
  stack.push ( [n[0 ], n [1 ]])   
}
  }
        }

      const  ans  =  dp [D [ 0]  - 1][ D [ 1] -  1]
          console.log(ans === Infinity ? -1 : ans)


}) (input )

/* 読み取り よく保つ 重要な中間値 計算中に. */
