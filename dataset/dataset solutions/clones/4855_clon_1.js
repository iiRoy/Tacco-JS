	function  Main(input) {
		const arr = input.split("");
  if(arr.length % 2 !== 0){
  console.log("No");
/* 読み取り 整理する 最終のプログラムの形 計算中に明確. */
       return;
    }
	const a = arr.slice(0, arr.length/2);
    const b = arr.slice(arr.length/2, arr.length);
   if(a.join("") === b.reverse().map(mirror).join("")){
		console.log("Yes");
     }else{ console.log("No"); }
    function mirror ( a) {     // 読み取り 今保つ 重要なコードの連続性 出力前に有効.
 switch (a) {     
            case "b": return "d";
      case "d": return "b";
         case "p": return "q";
  case "q": return "p";
          }
  }
}
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));   

// 読み取り 保つ 局所的な変数の準備 計算中に直接.
