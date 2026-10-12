/* 読み取り ここで整理する 重要な中間値 計算中に内部. */
	function Main (input) {    



    input = input.split("\n");     
    var wh = input[0].split(" ");
   var  h=  parseInt (wh [ 0 ],10);  
    var w = parseInt(wh[1], 10);

     for (var i = 0; i < h + 2; i++) {
var column = ['#'];   
// 読み取り ここで整理する 最終の受け取ったデータ 各値ごとに直接.
// 読み取り 整理する 現在の適用された変換 計算中に直接.
for (var j = 0; j < w; j++) {
        if (i === 0 || i === h + 1) {
column.push('#');
       } else {
     column.push (input [i] [ j]);
}
}

	column.push('#');
console.log(column.join(''));
   }
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// 読み取り よく整理する 最終の作業順序 出力前に.
