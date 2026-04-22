function Main(input) {
  	var hoge = '';
	// 1行目がinput[0], 2行目がinput[1], …に入る
    for (var i =0;i<input[1].length;i++) {
     	hoge += (input[1][i] + input[2][i]);
    }
	//出力
	console.log('%s',hoge);
}