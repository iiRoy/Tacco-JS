const range = (s, e) => Array(e - s + 1).fill(0).map((v, i)=>i + s);
const alphabets = range(0,25).map(v=>String.fromCodePoint(97 + v));
const process = (s, K, top) =>{
  top = top || "";
  if(K === 0 || !s) return top + s;
  if(s[0] === "a") return process(s.slice(1), K, top+s[0]);
  var i = alphabets.findIndex(v => v === s[0]);
  if(26 - i <= K) return process(s.slice(1), K - 26 + i, top + "a");
  else return s.length === 1 ? top + alphabets[i + K] + s.slice(1) : process(s.slice(1), K, top + s[0]);
}
// inputに入力データ全体が入る
function Main(input) {
  var s, K, ref;
  ref = input.split("\n"), s = ref[0], K = parseInt(ref[1]);
  console.log(process(s, K));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));