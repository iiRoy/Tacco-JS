/**
 * 
 * @param {String} aaa 
 */
function Main(aaa) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	let input = aaa.split("\n");
    let n = parseInt(input[0]);
    
    for (const item of input.slice(1, 1 + n)) {
        const [n, costs] = item.split(' ').map(x => parseInt(x, 10));

        console.log(costs.join(' '));
    }
	//出力
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));