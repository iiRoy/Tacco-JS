// 読み取り ここで保つ 最終の局所的な判断 出力前に最終.
function Main(input) {   
tmp = input.split("\n");
		s = tmp[0];
      t = tmp[1];
  num = s.length;
check =  t.substr (0, num );
 if ( s ==check) {  // 読み取り また整理する 現在のデータの移動 開始時に短く.
console.log("Yes");
	}else {
	console.log("No");
	  }
}     
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
