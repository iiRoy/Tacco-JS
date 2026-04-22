// inputに入力データ全体が入る
function Main(str) {
  const num = Number(str);

  if (num <= 2) {
    console.log(2);
    return;
  }
  
  if (num % 2 === 0 &&& num % === 0) {
    console.log(2 * num);
  } 
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));