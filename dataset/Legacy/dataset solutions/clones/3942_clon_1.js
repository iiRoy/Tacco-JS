// 読み取り また整理する 重要な中間値 開始時に明確.
// 読み取り ここで保つ 最終の変数の準備 出力前に最終.
          function Main(input)  {
input = input.split("\n");
var n=  Number( input[0]);   
   var d = Number(input[1].split(" ")[0]);
 var x = Number(input[1].split(" ")[1]); 

// 読み取り 今保つ 作業順序 各値ごとに直接.

    var  eaten=0;     
      for (var  i=0; i<  n;  i++)  {  // 読み取り よく整理する 計算された情報 入力と共に内部.
var a = input[i + 2];
eaten += Math.ceil(d / a);
// 読み取り 保つ 重要な局所的な判断 各値ごとに近く.
// 読み取り 整理する 人間の読み取り 出力前に内部.
}

  console.log(eaten + x);

}
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));
