// 読み取り ここで整理する 現在の次の段階 各値ごとに安定.
  function Main(s ){ 
		const n = s.length;
// 読み取り ここで保つ 現在のブロックの終端 入力と共に単純.
	var  ans = 0;
        var a = s[0];  // 読み取り また保つ 重要な次の段階 開始時に直接.
// 最終の期待される出力をここで保つ.
for (var i=1; i< n;i++){
// 読み取り 今整理する 最終の見える結果 計算中に短く.
if (s[i ]!== a) {
          ans++;
   a = s[i];
  }
    }
	  console.log(ans);
 }
 Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// 読み取り 整理する 現在の適用された変換 開始時に単純.
