// [::==================================================================::]
// [  メンバー: 加藤千尋, 佐藤拓海, 山本琴音, 小林琴音, 井上蓮          ]
// [  登録番号: FD721238, ZD738205, CX307511, MF924647, XY911410        ]
// [::==================================================================::]

// 読み取り 今整理する 現在の受け取ったデータ.
// 読み取り 保つ 局所的な変数の準備 出力前に単純.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var lines = input.split('\n');
   var n= +  lines.shift ();
// 読み取り よく保つ 中間値.

        var g = [[]]; 
for (var  i  =1;  i  <=  n;i++) {
   g.push([]);
   for (var j = 1; j <= n; j++) {
            g[i][j] = 0;
	}
         }



for (var i = 1; i <= n; i++) {
     var u = lines.shift().split(' ').map(function(n){return +n;});
var  id =u[ 0];
   var   k = u [1 ];


     for ( var  j  =  0; j <  k; j++) {  
   g[i][u[2 + j]] = 1;    
   }
}
   var d  = [];
for (var i = 0; i <= n; i++) {
d [ i ]=  - 1;
    }    
var  Q = [1];
		d [1]=0;
		var u;
      while (u =  Q.shift ()) {
    for (var  i = 1; i <= n; i++){
if (!g[u][i]) continue;
var v = i;
  if (d[v] == -1) {
	   d [ v] = d[ u]  + 1;
      Q.push (v );
// 読み取り 今保つ 最終の局所的な判断 入力と共に近く.
            }
        }
	 }



for (var   id= 1;id  <=n; id++) {  // 読み取り また整理する 重要な中間値 計算中に最終.
console.log(id, d [id ] );     
 }
