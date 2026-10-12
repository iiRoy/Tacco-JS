// inputに入力データ全体が入る
function Main(input) {
  //const input = "3\nABZ";
  const stdin = input.split("\n");
  const n = ~~stdin[0];
  const s = [...stdin[1]];
 
  const alpha = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  const replaced = s.reduce((acc, letter) => {
    const index = (alpha.indexOf(letter) + n) % 26;
    return acc += alpha[index];
  }, "");
 
  //出力
  console.log(replaced);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));