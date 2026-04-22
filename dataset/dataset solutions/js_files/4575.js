// inputに入力データ全体が入る
function Main(input) {
  const hoge = input.split(' ');
  const A = hoge[0];
  const B = hoge[1];
  const C = hoge[2];

  if (C >= A && C <= B) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// let input = `6 5 4`;
// Main(input);
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));