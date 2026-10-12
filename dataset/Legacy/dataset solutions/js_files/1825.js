function Main(input) {
  // 1行目がinput[0], 2行目がinput[1], …に入る
  input = input.split("\n");

  var tmp = input[0].split( ' ' );
  var h1 = parseInt( tmp[0] );
  var m1 = parseInt( tmp[1] );
  var h2 = parseInt( tmp[2] );
  var m2 = parseInt( tmp[3] );
  var k = parseInt( tmp[4] );

  var min1 = 60 * h1 + m1;
  var min2 = 60 * h2 + m2;
  var a = min2 - min1 - k;
  console.log( a );
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
