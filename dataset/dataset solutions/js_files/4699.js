process.stdin.resume();
process.stdin.setEncoding('utf8');
 
// inputに入力データ全体が入る
function Main(input) {
  // 1行目がline1, 2行目がline2, …に入る
  var tmp = input.split("\n");
  var line0 = tmp[0].split(" ");
  //var line1 = tmp[1].split(" ");
  //var line2 = tmp[2].split(" ");
  //var line3 = tmp[3].split(" ");

  var N = Number(line0[0]); //S
  var M = Number(line0[1]); //c
  //var A = Number(line0[1]);
  //var B = Number(line0[2]);
  
  var count = 0;
  //console.log(N + " "+ M)
  if(N > M/2) console.log(Math.floor(M/2));
  
  M = M - N*2;
  
  console.log(N + Math.floor(M / 4));


}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
