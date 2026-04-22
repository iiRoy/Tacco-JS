// inputに入力データ全体が入る
function Main(input) {

    input = input.split("\n");
  
    let N = parseInt(input[0], 10);

    let line = input[1].split(" ");

    let pre = 0;
    let cur = 0;

    let stock = 0;
    let money = 1000;
    for (let i = 1; i < N; i++) {
        pre = parseInt(line[i-1], 10);
        cur = parseInt(line[i], 10);
        if (pre < cur) {
            stock = Math.trunc(money / pre);
        }
        money += (cur - pre) * stock;
    }
    
	//出力
	console.log('%d',money);
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));