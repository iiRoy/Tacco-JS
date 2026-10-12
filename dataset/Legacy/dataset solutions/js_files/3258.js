function Main(input) {
	input = input.split("\n");
    var series = input[1].split(" ");
    series = series.map(str => parseInt(str, 10));
    var n = parseInt(input[0], 10);
    var water = 0;
    for(var i = 0; i < n; i++){
        water += (i==0)?series[i]:((series[i-1] < series[i])?(series[i]-series[i-1]):0);
    }
    console.log(water);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));