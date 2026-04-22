function Main(input) {
  const result = input.split('\n');
  const count = parseInt(result.shift());
  const answer = result.filter((item, index) => result.indexOf(item) === index);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));