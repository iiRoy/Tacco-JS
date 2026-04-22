function Main(input) {
  const inputArr = input.split(" ");
  const N = Number(inputArr[0]);
  const M = Number(inputArr[1]);
  if (N === M) {
    console.log('Yes')
  }
  else {
    console.log('No')
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));