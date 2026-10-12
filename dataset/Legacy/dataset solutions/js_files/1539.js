function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	var N = parseInt(input[0], 10);
    var tr = {x: 1, y: 1, ind: 0};
    var tl = {x: 10^9, y: 1, ind: 0};
    var br = {x: 1, y: 10^9, ind: 0};
    var bl = {x: 10^9, y: 10^9, ind: 0};
    for(var i=1; i<N; i++) {
      var tmp = input[i].split(" ");
      var x = parseInt(tmp[0], 10); 
      var y = parseInt(tmp[1], 10); 

      if(x >= tr.x && y >= tr.y) {
          tr.x = x;
          tr.y = y;
          tr.ind = i;
      }
      if(x <= tl.x && y >= tl.y) {
          tl.x = x;
          tl.y = y;
          tl.ind = i;
      }
      if(x >= br.x && y <= br.y) {
          br.x = x;
          br.y = y;
          br.ind = i;
      }
      if(x <= bl.x && y <= bl.y) {
          bl.x = x;
          bl.y = y;
          bl.ind = i;
      }
    }
    var result = Math.max(Math.abs(tr.x - bl.x) + Math.abs(tr.y - bl.y), Math.abs(tl.x - br.x) + Math.abs(tl.y - br.y));
	//出力
	console.log('%d', result);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));