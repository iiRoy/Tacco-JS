// inputに入力データ全体が入る
function Main(input) {
  var n = parseInt(input.split("\n")[0]);
  var a = input.split("\n")[1].split(" ");
  var list = Array(n);
  var b = [];
  for(var i=n; i>0; i--){
  	var cnt = 0;
    for(var j=2; i*j<n; j++){
    	cnt += list[i*j];
    }
    list[i-1] = (cnt + parseInt(a[i-1])) % 2
    if(list[i-1]==1)b.push(i);
  }
  console.log(b.length);
  if(b.length)console.log(b.join(" "));
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));