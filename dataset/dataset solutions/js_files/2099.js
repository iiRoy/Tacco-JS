// inputに入力データ全体が入る
function Main(input) {
var tmp = input.split(" ");
var s = parseInt(tmp[0], 10);
var a = parseInt(tmp[1], 10);
var b = parseInt(tmp[2], 10);
aa = a+b;;
var amari = s%aa;
var sho = Math.floor(s/aa);
var AAA = sho*a;
if(amari > a ){
   AAA += a;
}else{
   AAA += amari;
}
console.log(AAA);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));