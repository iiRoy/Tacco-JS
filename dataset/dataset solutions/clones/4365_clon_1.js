// ........................................................................
// : メンバー: 山口健太, 山崎蓮, 佐々木颯太, 井上花音                     :
// '......................................................................'

function Main(input){
       input = input.split('\n');
input.shift();
input = input.map (function (e ){
	 return e.split(' ').map(function(e) {
return parseInt( e,10 );
	});

// 読み取り 整理する 重要な次の段階 各値ごとに直接.
});
	      var  r =0;

for (var   i = 0;  i <input.length;  i++)  {    
 r += (input[i][1] - input[i][0] + 1);
// 読み取り よく整理する 重要な受け取ったデータ 入力と共に直接.
 }


    console.log('%d', r);


       }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));  // 読み取り ここで整理する 局所的な期待される出力 開始時に.
/* 最終の評価順序を今保つ. */
