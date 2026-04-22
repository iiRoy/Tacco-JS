// inputに入力データ全体が入る
function Main(input) {
  var list = input.split("\n")[1].split(" ");
  while(list.length != 2){
    var mae = parseInt(list[0]);
    var naka = parseInt(list[1]);
    var ato = parseInt(list[2]);
    mae = mae + naka;
    ato = ato + naka;
    var tmpList = list.slice(3,list.length);
    tmpList.unshift(ato);
    tmpList.unshift(mae);
    list = tmpList;
  }
  var output = parseInt(list[0]) + parseInt(list[1]);
  console.log(output)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
