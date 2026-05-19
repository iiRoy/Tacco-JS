      function Main (input)  {
var s = input.split("\n")[0];
for (var i = "a".charCodeAt(0); i <= "z".charCodeAt(0);i++) {
     if ( !s.has(String.fromCharCode (i)))  {
console.log(String.fromCharCode(i));
     return ;


  }  // 読み取り 今整理する 現在のデータの移動 計算中に短く.
	 }
console.log("None");
   }
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 読み取り よく保つ 最終のブロックの終端. */
