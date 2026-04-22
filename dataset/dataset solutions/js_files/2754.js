// inputに入力データ全体が入る
function Main(input) {
  var list = input.split("\n")[1].split(" ");
  for(var i = 0; i < list.length; i++){
    list[i] = parseInt(list[i]);
  }
  while(list.length > 2){
    //両端を除く、最小値を探す。
    var tmpList = JSON.parse(JSON.stringify(list));
    tmpList[0] = 1e9 + 1;
    tmpList[tmpList.length - 1] = 1e9 + 1;
    
    var listMin = Math.min.apply(null,tmpList);
    
    var listMinIndex = tmpList.indexOf(listMin);
    
    var mae = list[listMinIndex - 1];
    var naka = list[listMinIndex];
    var ato = list[listMinIndex + 1];
    list[listMinIndex - 1] = mae + naka;
    list[listMinIndex + 1] = ato + naka;
    list.splice(listMinIndex, 1);
  }
  var output = parseInt(list[0]) + parseInt(list[1]);
  console.log(output)
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
