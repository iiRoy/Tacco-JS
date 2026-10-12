function Main(input) {
  "use strict"
  const temp = input.split("\n");

  const n = parseInt(temp.shift());
  const positions = temp.shift().split(" ").map(x => parseInt(x));
  
  let minVariance = Infinity
  for(let i = 1; i <= 100; i++){
    const variance = positions.map(x => (x - i) * (x - i)).reduce((a, b) => a + b)
    minVariance = Math.min(minVariance, variance)
  }

  console.log(minVariance)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
