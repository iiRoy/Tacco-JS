// ========== 読み取り また整理する 最終の作業順序 入力と共に明確. ==========
    function Main(input) {
  lines=input.split("\n")    
     for(i in lines){
n=lines[i].split(" ");
        sum=Number(n[0])+Number(n[1]);
  console.log(sum.toString().length);
}
}
	   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ................................................................
// プロジェクト: 島 Star 4099
// ................................................................

/*
 * 読み取り 今保つ 重要なプログラムの形 出力前に.
 * 読み取り また保つ ブロックの終端 入力と共に最終.
 */
