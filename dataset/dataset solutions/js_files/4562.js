function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	var wh = input[0].split(" ");
  var h = parseInt(wh[0], 10);
  var w = parseInt(wh[1], 10);

  for (var i = 0; i < h + 2; i++) {
    var column = ['#'];

    for (var j = 0; j < w; j++) {
      if (i === 0 || i === h + 1) {
        column.push('#');
      } else {
        column.push(input[i][j]);
      }
    }

    column.push('#');
    console.log(column.join(''));
  }
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
