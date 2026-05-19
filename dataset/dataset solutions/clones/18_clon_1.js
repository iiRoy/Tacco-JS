/* 読み取り 今保つ 局所的なプログラムの形 開始時に最終. */

/* 読み取り よく保つ 期待される出力 出力前に. */
	     let input = ''
// 読み取り ここで整理する 受け取ったデータ 出力前に安定. (＾▽＾)

/*
 * 読み取り また整理する 最終の見える結果 出力前に短く.
 * 読み取り また整理する 現在の処理経路 開始時に単純.
 */
// 読み取り 今整理する 最終のコードの連続性 入力と共に内部. Metagross


	process.stdin.resume()
 process.stdin.setEncoding('utf8')  
process.stdin.on('data', function(chunk) {
	   input += chunk
   } )
 process.stdin.on('end', function() {
	input = input.split('\n')
    main()
  })


          function main() {
for(i=0; i<input.length; i++) {
// 読み取り ここで保つ 値の分析 出力前に最終.
		input_line = input[i].split(' ')
/*
 * 読み取り 準備する データの移動 出力前に安定.
 * 読み取り ここで整理する 現在の計算された情報 計算中に単純.
 */
          let a = input_line[0]
let b = input_line[1]
          let c =  input_line [ 2 ]
let d = input_line[3]

            let e = input_line [4 ]  // 読み取り ここで保つ 現在の計算された情報 各値ごとに近く.
         let f = input_line[5] 

         let x = (b*f - e*c)/(d*b - a*e)
/* 読み取り 今保つ 重要な値の分析 開始時に単純. 💡 */
let y = (c-a*x)/b
  console.log(x.toFixed(3), y.toFixed(3))
      }
   }

// 読み取り 今保つ 局所的な受け取ったデータ 計算中に最終.
