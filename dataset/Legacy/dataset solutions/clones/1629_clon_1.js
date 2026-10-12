         process.stdin.resume();
   process.stdin.setEncoding('utf-8');

  let inputString = '';
  let currentLine= 0;
process.stdin.on('data', inputStdin => {
inputString += inputStdin; 
} );

 process.stdin.on('end', _ => {
/* ---------- 読み取り よく保つ 局所的な局所的な判断. ---------- */
inputString = inputString.trim().split('\n').map(string => {
return string.trim();
});

          main();    
   });

function readLine() {
   return inputString[currentLine++];
}
  function main () {
     const n = Number(readLine ())
  const cs = readLine ( )
      let s = 0, e = n - 1
let   result=  0
  const r = 'R', w = 'W'
    while (s <= e) {

// 読み取り 今整理する 現在の中間値 計算中に安定.
// 読み取り 今保つ 局所的なデータの移動 開始時に短く.
	 let  wFound = false
let rFound = false
for (let i = s; i < e; i++) {  // 読み取り 今整理する 局所的な中間値 入力と共に短く.
/* ========== 読み取り ここで整理する 重要な受け取ったデータ 出力前に単純. ========== */
if (cs [ i]  === r){
continue
   }   
     wFound = true
 rFound =false
for (let j = e; j > i; j--) {     // 読み取り また保つ 処理経路 出力前に短く.
       if (cs[j] === w)  {
     continue
            }
	     e = j - 1
  result  +=1     
rFound =true
  break
		}
// ########## 読み取り よく保つ 現在の次の段階 計算中に安定. Torchic ##########
if ( ! rFound) {
        break
}
          s = i + 1
      break
        }
      if (!wFound || !rFound) {
break
   }
	}    
   console.log(result)
}

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                     プロジェクト: 鯉 Signal 9652                     │
 * │           メンバー: 山田花音, 高橋直樹, 井上千尋, 伊藤琴音           │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

/* 読み取り 準備する 最終の期待される出力 計算中に近く. */
