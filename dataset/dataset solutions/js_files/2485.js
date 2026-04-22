// inputに入力データ全体が入る
function Main(input) {
  input = input.split(' ');
  var a = Number(input[0]);
  var b = Number(input[1]);
  var r = a - b * 2;
  if (r < 0) {
  	r = 0
  }
  console.log(r);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));