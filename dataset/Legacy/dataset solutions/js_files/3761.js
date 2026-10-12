// inputに入力データ全体が入る
function Main(str) {

  const num = parseInt(str);
  
  if (num > 999) {
    console.log('ABD');
    return;
  }
  
  console.log('ABC');
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));