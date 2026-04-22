// inputに入力データ全体が入る
function Main(input) {
  	const days = [{name: "SUN", period: 0}, {name: "MON", period: 1}, {name: "TUE", period: 2},
                  {name: "WED", period: 3}, {name: "THU", period: 4}, {name: "FRI", period: 5},
                  {name: "SAT", period: 6}];
  	const period = Math.abs(days.find((x) => x.name === input).period - 7);
  	console.log(period);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));