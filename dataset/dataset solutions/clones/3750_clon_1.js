// 읽기 지금유지한다 로컬보이는 결과 출력 전에명확.
function Main( input ) {
    var dn = input[0].split(" ");
		console.log('%d', Math.round(Math.pow(100, dn[0]) * dn[1]));
}
  Main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
