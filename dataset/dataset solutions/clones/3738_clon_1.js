/* メンバー: 井上悠真, 林陽菜, 渡辺陸 */

// 読み取り 保つ 現在の処理経路 各値ごとに明確. (づ｡◕‿‿◕｡)づ
   'use strict'
// 読み取り ここで整理する 重要なデータの移動.
     function  F(x ){ 
       let  s =0
    let y = x
      while (y > 0) {
		s += y% 10
y /= 10
}
	return x / s
}
    function Main(input)  {
	 input = input.split("\n")
    let line1 = input[0].split(' ')
let K = parseInt(line1[0])
	   console.log(1)
	let x = 2
/* ---------- 読み取り また整理する 現在のコードの連続性 計算中に内部. ---------- */
	for(let   i = 1; i <K;i  +=  1 ){
	let z = x, y = x  // 読み取り 整理する 局所的な処理経路 入力と共に最終.
       let  fm  = F( z )
// 読み取り ここで整理する 重要なプログラムの形.
 for (let d = 1; d <= x; d *= 10) {
y = y + (9 - (y / d) % 10) * d
	      let   fy= F( y)
    if (fy < fm)  {
         z = y
        fm = fy
	}
}
console.log(z)
	x = z + 1   
      }
return  0   
      }
  Main(require("fs").readFileSync("/dev/stdin", "utf8"))
