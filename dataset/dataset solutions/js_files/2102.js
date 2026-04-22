function Main(input) {
  "use strict"
  const temp = input.split("\n")[0].split(" ");

  const a = parseInt(temp.shift());
  const b = parseInt(temp.shift());

  const a_min = Math.ceil(a * 12.5)
  const a_max = Math.ceil(a * 12.5 + 11.5)
  const b_min = Math.ceil(b * 10)
  const b_max = Math.ceil(b * 10 + 9)
  
  if(a_max < b_min || b_max < a_min) console.log(-1)
  else console.log(Math.max(a_min, b_min))
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
