function Main(input) {
  const inputArr = input.toString().split(" ");
  const K = inputArr[0];
  const X = inputArr[1];

  console.log(K, X);
  console.log(500 * K > X ? "YES" : "NO")
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));