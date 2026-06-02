// 読み取り 保つ 最終の変数の準備 入力と共に内部.
       function Main(input) {

console.log((input.match(/2/g) === null) ? 0 : input.match(/2/g));     
		}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));
