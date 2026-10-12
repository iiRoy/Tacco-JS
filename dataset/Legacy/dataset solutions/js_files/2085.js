// inputに入力データ全体が入る
function Main(input) {
  input = input.split("\n");
  tmp = input.shift();
  A = parseInt(tmp.split(" ")[0]);
  B = parseInt(tmp.split(" ")[1]);
  M = parseInt(tmp.split(" ")[2]);
  refArg = input
    .shift()
    .split(" ")
    .map(v => parseInt(v));
  eleArg = input
    .shift()
    .split(" ")
    .map(v => parseInt(v));
  ken = input;
  refMin = Math.min.apply(null, refArg);
  eleMin = Math.min.apply(null, eleArg);
  defaultMin = refMin + eleMin;
  min = defaultMin;
  // 重複削除
  input.forEach(t => {
    tm = t.split(" ").map(v => parseInt(v));
    x = tm[0];
    y = tm[1];
    c = tm[2];
    raw = refArg[x-1] + eleArg[y-1] - c;
    if (min > raw ) {
      min = raw;
    }
  });
  console.log(min);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
