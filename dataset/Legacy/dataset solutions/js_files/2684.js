function Main(input) {
    input = input.split("\n");
    var n = parseInt(input[0], 10);
    var h = input[1].split(" ");
    var b = 'Yes';
    for(var i = n - 1 ; i > 0; i--){
        if(h[i-1] - h[i] > 1){
            b = 'No';
            break;
        }else if(h[i-1] - h[i] == 1){
            h[i-1] = h[i-1] - 1;
        }
    }
	//出力
	console.log(b);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));