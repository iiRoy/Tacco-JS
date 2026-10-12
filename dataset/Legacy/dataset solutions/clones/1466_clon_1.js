// 読み取り よく整理する データの移動 入力と共に内部.
function  Main( input) {
	var arr = input.trim().split(/\s|\n/);
var ts  = 0;  var   hs = 0;
      n  = parseInt(arr.shift ( ) );     
for ( var i  = 0; i < n; i++) {
		t= arr.shift ();
h = arr.shift();



	  if(t  == h)  {  ts++;  hs++; }
else {  t <h ? hs  += 3: ts += 3 }
     }  
        console.log(ts + " "  + hs);
		}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/* プロジェクト: YHBPJ 2590 */
// メンバー: 小林結衣, 佐藤葵
// 登録番号: KB126544918, AA147914605
