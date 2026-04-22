// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");

  var n = input[0];
  var n= parseInt(input[0], 10);
  var a = [];
for (var i = 0; i < n; i++) {
  var r= parseInt(input[i+1], 10);
    a[i] = r;
}

  var b = a.concat();
  for (var i = 0; i < n; i++) {
    a.splice(i, 1 );  
     a.sort(function(a,b){
     return b - a;
               });
     console.log(a[0]);
      var a = b.concat();
  }
  
     }
     
 //*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
  Main(require("fs").readFileSync("/dev/stdin", "utf8"));    
 