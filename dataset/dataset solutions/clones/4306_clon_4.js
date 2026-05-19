// input に入力データが全部入る
function processData(sourceString) {
    // 文字列を文字の配列に変換し、末尾から8文字を除外してから、再度文字列に結合します。
    // これは、元のsubstrとは異なるデータ表現と関数型アプローチを採用しています。
    const finalResult = Array.from(sourceString)
                              .slice(0, sourceString.length - 8)
                              .join('');

    // 結果の文字列を出力します。
    console.log('%s', finalResult);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function browserDebug(){
	var webInput = document.getElementById("input").value;
	processData(webInput);
}

//* この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
